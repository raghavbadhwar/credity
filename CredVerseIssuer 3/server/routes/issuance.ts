import { Router } from "express";
import { storage } from "../storage";
import { issuanceService } from "../services/issuance";
import { apiKeyOrAuthMiddleware } from "../auth";
import { idempotencyMiddleware } from "@credverse/shared-auth";
import { revokeCredentialStatus } from "../services/status-list-service";
import {
    getDeadLetterJobs,
    getJobStatus,
    getQueueStats,
    isQueueAvailable,
    replayDeadLetterJob,
} from "../services/queue-service";

const router = Router();

router.use(apiKeyOrAuthMiddleware);
const writeIdempotency = idempotencyMiddleware({ ttlMs: 6 * 60 * 60 * 1000 });


// eslint-disable-next-line @typescript-eslint/no-explicit-any
function authorizeQueueOperations(req: any, res: any): boolean {
    const hasApiKey = typeof req.headers?.["x-api-key"] === "string";
    if (hasApiKey) {
        return true;
    }

    const role = typeof req.user?.role === "string" ? req.user.role.toLowerCase() : "";
    if (role === "admin" || role === "issuer") {
        return true;
    }

    res.status(403).json({
        message: "Queue operations require issuer/admin role or API key",
    });
    return false;
}

router.post("/credentials/:id/offer", writeIdempotency, async (req, res) => {
    try {
        const credential = await storage.getCredential(req.params.id);
        if (!credential) {
            return res.status(404).json({ message: "Credential not found" });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tenantId = (req as any).tenantId;
        if (credential.tenantId !== tenantId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const token = issuanceService.createOffer(credential.id);
        // Use public route
        const baseUrl = `${req.protocol}://${req.get('host')}/api/v1/public/issuance/offer/consume?token=${token}`;
        const deepLink = `credverse://offer?url=${encodeURIComponent(baseUrl)}`;

        res.json({
            offerToken: token,
            offerUrl: baseUrl, // URL for wallet to fetch credential
            deepLink: deepLink, // Deep link to open wallet app
            qrCodeData: deepLink // Data to embed in QR code
        });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/credentials/issue", writeIdempotency, async (req, res) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tenantId = (req as any).tenantId;
        const { templateId, issuerId, recipient, credentialData } = req.body;

        if (!templateId || !issuerId || !recipient || !credentialData) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const credential = await issuanceService.issueCredential(
            tenantId,
            templateId,
            issuerId,
            recipient,
            credentialData
        );

        res.status(201).json(credential);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        const message = error.message || "Internal Server Error";
        const status = message.includes("queue") || message.includes("REDIS_URL") ? 503 : 500;
        res.status(status).json({ message });
    }
});

router.post("/credentials/bulk-issue", writeIdempotency, async (req, res) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tenantId = (req as any).tenantId;
        const { templateId, issuerId, recipientsData } = req.body;

        if (!templateId || !issuerId || !Array.isArray(recipientsData)) {
            return res.status(400).json({ message: "Invalid bulk issuance data" });
        }

        const result = await issuanceService.bulkIssue(
            tenantId,
            templateId,
            issuerId,
            recipientsData
        );

        res.status(202).json(result);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
});

router.get("/queue/stats", async (_req, res) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!authorizeQueueOperations(_req as any, res)) {
            return;
        }
        if (!isQueueAvailable()) {
            return res.status(503).json({
                message: "Queue service unavailable",
                queue: { available: false },
            });
        }

        const stats = await getQueueStats();
        res.json({
            queue: {
                available: true,
                stats,
            },
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Failed to fetch queue stats" });
    }
});

router.get("/queue/jobs/:jobId", async (req, res) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!authorizeQueueOperations(req as any, res)) {
            return;
        }
        if (!isQueueAvailable()) {
            return res.status(503).json({
                message: "Queue service unavailable",
                queue: { available: false },
            });
        }

        const status = await getJobStatus(req.params.jobId);
        if (!status) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.json(status);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Failed to fetch queue job status" });
    }
});

router.get("/queue/dead-letter", async (req, res) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!authorizeQueueOperations(req as any, res)) {
            return;
        }
        if (!isQueueAvailable()) {
            return res.status(503).json({
                message: "Queue service unavailable",
                queue: { available: false },
            });
        }

        const limit = Number(req.query.limit || 50);
        const entries = await getDeadLetterJobs(limit);
        res.json({
            count: entries.length,
            entries,
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Failed to fetch dead-letter queue" });
    }
});

router.post("/queue/dead-letter/:entryId/replay", writeIdempotency, async (req, res) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!authorizeQueueOperations(req as any, res)) {
            return;
        }
        if (!isQueueAvailable()) {
            return res.status(503).json({
                message: "Queue service unavailable",
                queue: { available: false },
            });
        }

        const replay = await replayDeadLetterJob(req.params.entryId);
        res.status(202).json({
            success: true,
            ...replay,
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        const message = error?.message || "Failed to replay dead-letter entry";
        const status = message.toLowerCase().includes("not found") ? 404 : 500;
        res.status(status).json({ message });
    }
});

router.get("/credentials/:id", async (req, res) => {
    try {
        const credential = await storage.getCredential(req.params.id);

        if (!credential) {
            return res.status(404).json({ message: "Credential not found" });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tenantId = (req as any).tenantId;
        if (credential.tenantId !== tenantId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        res.json(credential);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// List all credentials for tenant
router.get("/credentials", async (req, res) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tenantId = (req as any).tenantId;
        const credentials = await storage.listCredentials(tenantId);
        res.json(credentials);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Revoke a credential
router.post("/credentials/:id/revoke", writeIdempotency, async (req, res) => {
    try {
        const credential = await storage.getCredential(req.params.id);

        if (!credential) {
            return res.status(404).json({ message: "Credential not found" });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tenantId = (req as any).tenantId;
        if (credential.tenantId !== tenantId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const reason = req.body?.reason || "revoked_by_issuer";
        await issuanceService.revokeCredential(req.params.id, reason);
        await revokeCredentialStatus(req.params.id);

        res.json({ message: "Credential revoked successfully", id: req.params.id });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
