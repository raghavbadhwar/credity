import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

/**
 * Queue Service for CredVerse Issuer
 * Handles background job processing using BullMQ + Redis
 */

// Redis connection configuration
const REDIS_URL = process.env.REDIS_URL; // No fallback - require explicit configuration

let redisConnection: IORedis | null = null;
let issuanceQueue: Queue | null = null;
let issuanceWorker: Worker | null = null;
let queueEvents: QueueEvents | null = null;

// Job status tracking
const jobResults = new Map<string, JobResult>();

export interface IssuanceJobData {
    tenantId: string;
    templateId: string;
    issuerId: string;
    recipients: Array<{
        recipient: any;
        data: any;
    }>;
}

export interface JobResult {
    jobId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    total: number;
    processed: number;
    success: number;
    failed: number;
    errors: string[];
    startedAt?: Date;
    completedAt?: Date;
}

/**
 * Initialize the queue service
 */
export async function initQueueService(): Promise<boolean> {
    // Skip Redis if not configured
    if (!REDIS_URL) {
        console.log('[Queue] REDIS_URL not configured, using in-memory processing');
        return false;
    }

    try {
        // Create Redis connection
        redisConnection = new IORedis(REDIS_URL, {
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            retryStrategy: (times) => {
                if (times > 3) return null; // Stop retrying after 3 attempts
                return Math.min(times * 200, 1000);
            },
        });

        // Test connection with timeout
        const pingResult = await Promise.race([
            redisConnection.ping(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 3000))
        ]);

        if (pingResult !== 'PONG') throw new Error('Redis ping failed');

        console.log('[Queue] Connected to Redis');

        // Create the issuance queue
        issuanceQueue = new Queue('credential-issuance', {
            connection: redisConnection,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: { count: 100 },
                removeOnFail: { count: 50 },
            },
        });

        // Create queue events for monitoring
        queueEvents = new QueueEvents('credential-issuance', {
            connection: redisConnection,
        });

        console.log('[Queue] Queue service initialized');
        return true;
    } catch (error) {
        console.warn('[Queue] Redis not available, falling back to in-memory processing');
        // Clean up failed connection
        if (redisConnection) {
            redisConnection.disconnect();
            redisConnection = null;
        }
        return false;
    }
}

/**
 * Start the issuance worker
 */
export function startIssuanceWorker(
    processCredential: (tenantId: string, templateId: string, issuerId: string, recipient: any, data: any) => Promise<void>
): void {
    if (!redisConnection) {
        console.log('[Queue] Worker not started - Redis not available');
        return;
    }

    issuanceWorker = new Worker(
        'credential-issuance',
        async (job: Job<IssuanceJobData>) => {
            const { tenantId, templateId, issuerId, recipients } = job.data;
            const jobId = job.id!;

            console.log(`[Queue] Processing job ${jobId} with ${recipients.length} credentials`);

            // Initialize job result
            const result: JobResult = {
                jobId,
                status: 'processing',
                total: recipients.length,
                processed: 0,
                success: 0,
                failed: 0,
                errors: [],
                startedAt: new Date(),
            };
            jobResults.set(jobId, result);

            // Process each credential
            for (let i = 0; i < recipients.length; i++) {
                const { recipient, data } = recipients[i];

                try {
                    await processCredential(tenantId, templateId, issuerId, recipient, data);
                    result.success++;
                } catch (error: any) {
                    result.failed++;
                    result.errors.push(`Recipient ${i + 1}: ${error.message}`);
                    console.error(`[Queue] Job ${jobId} failed for recipient ${i + 1}:`, error);
                }

                result.processed++;

                // Update job progress
                await job.updateProgress(Math.round((result.processed / result.total) * 100));
            }

            result.status = 'completed';
            result.completedAt = new Date();
            jobResults.set(jobId, result);

            console.log(`[Queue] Job ${jobId} completed: ${result.success}/${result.total} success`);

            return result;
        },
        {
            connection: redisConnection,
            concurrency: 5, // Process 5 credentials concurrently
        }
    );

    issuanceWorker.on('failed', (job, error) => {
        console.error(`[Queue] Job ${job?.id} failed:`, error);
        if (job?.id) {
            const result = jobResults.get(job.id);
            if (result) {
                result.status = 'failed';
                result.errors.push(`Job failed: ${error.message}`);
                jobResults.set(job.id, result);
            }
        }
    });

    console.log('[Queue] Issuance worker started');
}

/**
 * Add a bulk issuance job to the queue
 */
export async function addBulkIssuanceJob(data: IssuanceJobData): Promise<{ jobId: string; queued: boolean }> {
    if (!issuanceQueue) {
        // Fallback: return a job ID but process will happen synchronously
        const jobId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return { jobId, queued: false };
    }

    const job = await issuanceQueue.add('bulk-issue', data, {
        priority: data.recipients.length > 100 ? 2 : 1, // Lower priority for large batches
    });

    // Initialize job result
    jobResults.set(job.id!, {
        jobId: job.id!,
        status: 'pending',
        total: data.recipients.length,
        processed: 0,
        success: 0,
        failed: 0,
        errors: [],
    });

    console.log(`[Queue] Bulk issuance job ${job.id} added with ${data.recipients.length} credentials`);

    return { jobId: job.id!, queued: true };
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string): Promise<JobResult | null> {
    // Check in-memory results first
    const memoryResult = jobResults.get(jobId);
    if (memoryResult) {
        return memoryResult;
    }

    // Check queue if available
    if (issuanceQueue) {
        const job = await issuanceQueue.getJob(jobId);
        if (job) {
            const state = await job.getState();
            const progress = job.progress as number;

            return {
                jobId,
                status: state === 'completed' ? 'completed' : state === 'failed' ? 'failed' : 'processing',
                total: job.data.recipients.length,
                processed: Math.round((progress / 100) * job.data.recipients.length),
                success: 0,
                failed: 0,
                errors: [],
            };
        }
    }

    return null;
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
} | null> {
    if (!issuanceQueue) {
        return null;
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
        issuanceQueue.getWaitingCount(),
        issuanceQueue.getActiveCount(),
        issuanceQueue.getCompletedCount(),
        issuanceQueue.getFailedCount(),
        issuanceQueue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
}

/**
 * Check if queue service is available
 */
export function isQueueAvailable(): boolean {
    return issuanceQueue !== null;
}

/**
 * Gracefully shutdown queue service
 */
export async function shutdownQueueService(): Promise<void> {
    if (issuanceWorker) {
        await issuanceWorker.close();
    }
    if (queueEvents) {
        await queueEvents.close();
    }
    if (issuanceQueue) {
        await issuanceQueue.close();
    }
    if (redisConnection) {
        await redisConnection.quit();
    }
    console.log('[Queue] Service shutdown complete');
}
