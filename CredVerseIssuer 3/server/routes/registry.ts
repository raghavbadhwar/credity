import { Router } from "express";
import { storage } from "../storage";
import { insertIssuerSchema } from "@shared/schema";
import { apiKeyMiddleware } from "../auth";
import { z } from "zod";

const router = Router();

// Public Endpoints for verification (accessible by Verifiers/Wallets)
router.get("/registry/public/issuers/:id", async (req, res) => {
    try {
        const issuer = await storage.getIssuer(req.params.id);
        if (!issuer) return res.status(404).json({ message: "Issuer not found" });
        // Return only public info
        res.json({
            id: issuer.id,
            name: issuer.name,
            domain: issuer.domain,
            did: issuer.did,
            trustStatus: issuer.trustStatus,
            meta: issuer.meta
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/registry/public/issuers/did/:did", async (req, res) => {
    try {
        // We need a storage method for this, or list and filter (inefficient but okay for MVP)
        // MVP: List all issuers and find
        // TODO: Add getIssuerByDid to storage
        // For now, assuming direct DB query isn't exposed in storage interface easily without editing storage.ts
        // I'll try to implement it or scan.
        // Assuming issuer ID lookup is primary for now.
        res.status(501).json({ message: "Not implemented yet" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Apply API Key middleware to all registry routes
router.use(apiKeyMiddleware);

router.post("/issuers", async (req, res) => {
    try {
        const tenantId = (req as any).tenantId;
        const parseResult = insertIssuerSchema.safeParse({ ...req.body, tenantId });

        if (!parseResult.success) {
            return res.status(400).json({ message: "Invalid issuer data", errors: parseResult.error });
        }

        const issuer = await storage.createIssuer(parseResult.data);
        res.status(201).json(issuer);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/issuers/:id", async (req, res) => {
    try {
        const issuer = await storage.getIssuer(req.params.id);

        if (!issuer) {
            return res.status(404).json({ message: "Issuer not found" });
        }

        // Ensure tenant owns this issuer
        const tenantId = (req as any).tenantId;
        if (issuer.tenantId !== tenantId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        res.json(issuer);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
