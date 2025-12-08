import { Router } from "express";
import { storage } from "../storage";
import { issuanceService } from "../services/issuance";
import { apiKeyMiddleware } from "../auth";
import { z } from "zod";

const router = Router();

router.use(apiKeyMiddleware);

router.post("/credentials/:id/offer", async (req, res) => {
    try {
        const credential = await storage.getCredential(req.params.id);
        if (!credential) {
            return res.status(404).json({ message: "Credential not found" });
        }

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
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/credentials/issue", async (req, res) => {
    try {
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
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
});

router.post("/credentials/bulk-issue", async (req, res) => {
    try {
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
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
});

router.get("/credentials/:id", async (req, res) => {
    try {
        const credential = await storage.getCredential(req.params.id);

        if (!credential) {
            return res.status(404).json({ message: "Credential not found" });
        }

        const tenantId = (req as any).tenantId;
        if (credential.tenantId !== tenantId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        res.json(credential);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// List all credentials for tenant
router.get("/credentials", async (req, res) => {
    try {
        const tenantId = (req as any).tenantId;
        const credentials = await storage.listCredentials(tenantId);
        res.json(credentials);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Revoke a credential
router.post("/credentials/:id/revoke", async (req, res) => {
    try {
        const credential = await storage.getCredential(req.params.id);

        if (!credential) {
            return res.status(404).json({ message: "Credential not found" });
        }

        const tenantId = (req as any).tenantId;
        if (credential.tenantId !== tenantId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await storage.revokeCredential(req.params.id);

        res.json({ message: "Credential revoked successfully", id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
