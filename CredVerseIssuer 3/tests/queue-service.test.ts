import { describe, expect, it } from 'vitest';
import { getDeadLetterJobs, isQueueAvailable, replayDeadLetterJob } from '../server/services/queue-service';

describe('queue service dead-letter helpers', () => {
    it('returns empty dead-letter list when queue is unavailable', async () => {
        expect(isQueueAvailable()).toBe(false);
        await expect(getDeadLetterJobs()).resolves.toEqual([]);
    });

    it('rejects replay when queue is unavailable', async () => {
        await expect(replayDeadLetterJob('missing-entry')).rejects.toThrow('Queue service unavailable');
    });
});
