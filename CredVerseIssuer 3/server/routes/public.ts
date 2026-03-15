import { Router } from "express";
import { storage } from "../storage";
import { issuanceService } from "../services/issuance";

const router = Router();

// Public: Consume Offer
router.get("/issuance/offer/consume", async (req, res) => {
    try {
        const token = req.query.token as string;
        if (!token) return res.status(400).json({ message: "Token required" });

        const credentialId = issuanceService.getOfferCredentialId(token);
        if (!credentialId) return res.status(404).json({ message: "Invalid or expired offer token" });

        const credential = await storage.getCredential(credentialId);
        if (!credential) return res.status(404).json({ message: "Credential not found" });

        res.json({
            credential,
            vcJwt: credential.vcJwt
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Public: Get Issuer Profile
router.get("/registry/issuers/:id", async (req, res) => {
    try {
        const issuer = await storage.getIssuer(req.params.id);
        if (!issuer) return res.status(404).json({ message: "Issuer not found" });
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

// Public: Get Issuer by DID (for verification)
router.get("/registry/issuers/did/:did", async (req, res) => {
    try {
        const did = decodeURIComponent(req.params.did);
        const issuer = await storage.getIssuerByDid(did);
        if (!issuer) return res.status(404).json({ message: "Issuer not found" });
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

// Public: Get Template
router.get("/templates/:id", async (req, res) => {
    try {
        const template = await storage.getTemplate(req.params.id);
        if (!template) return res.status(404).json({ message: "Template not found" });
        res.json({
            id: template.id,
            name: template.name,
            schema: template.schema,
            version: template.version,
            issuerId: template.tenantId
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
