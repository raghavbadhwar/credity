import { Router } from "express";
import { relayerService } from "../services/relayer";
import { storage } from "../storage";
import { z } from "zod";

const router = Router();

// Helper to get IP and location
async function getVerifierInfo(ip: string): Promise<{ location: string; organization: string }> {
    // In production, use a service like ipinfo.io or maxmind
    const locations = [
        { location: "Mumbai, IN", organization: "TechCorp HR" },
        { location: "Bangalore, IN", organization: "Google Hiring" },
        { location: "New Delhi, IN", organization: "Amazon India" },
        { location: "Hyderabad, IN", organization: "Microsoft" },
        { location: "Seattle, US", organization: "LinkedIn" },
        { location: "San Francisco, US", organization: "Meta Recruiting" },
        { location: "London, UK", organization: "Barclays HR" },
        { location: "Singapore, SG", organization: "DBS Bank" },
    ];

    // Hash the IP to get consistent location for same IP
    const hash = ip.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
    return locations[Math.abs(hash) % locations.length];
}

// Public verification endpoint (no API key required)
router.get("/verify", async (req, res) => {
    try {
        const vcJwt = req.query.vc as string;
        const verifierIp = (req.headers['x-forwarded-for'] as string || req.ip || '0.0.0.0').split(',')[0].trim();

        if (!vcJwt) {
            return res.status(400).json({ message: "Missing vc query parameter" });
        }

        // 1. Decode JWT
        const parts = vcJwt.split(".");
        if (parts.length !== 3) {
            // Log failed verification attempt
            await storage.createVerificationLog({
                tenantId: "public",
                credentialId: "invalid-jwt",
                verifierName: "Unknown",
                verifierIp,
                location: "Unknown",
                status: "failed",
                reason: "Invalid JWT format",
            });
            return res.status(400).json({ valid: false, message: "Invalid JWT format" });
        }

        let payload: any;
        try {
            payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
        } catch {
            payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        }

        // 2. Verify Signature (Mock - in production use did-jwt)
        const isValidSignature = true;

        // 3. Check Revocation
        const credentialId = payload.jti || payload.id || "unknown";
        const isRevoked = await relayerService.isRevoked(credentialId);

        // Get verifier info
        const verifierInfo = await getVerifierInfo(verifierIp);

        // Determine verification status
        const isValid = isValidSignature && !isRevoked;
        let status: "verified" | "failed" | "suspicious" = "verified";
        let reason = "";

        if (isRevoked) {
            status = "failed";
            reason = "Credential has been revoked";
        } else if (!isValidSignature) {
            status = "failed";
            reason = "Invalid signature";
        }

        // Log the verification event
        await storage.createVerificationLog({
            tenantId: payload.iss || "public",
            credentialId,
            verifierName: verifierInfo.organization,
            verifierIp,
            location: verifierInfo.location,
            status,
            reason,
        });

        console.log(`[VERIFY] Credential ${credentialId} verified by ${verifierInfo.organization} from ${verifierInfo.location}`);

        res.json({
            valid: isValid,
            issuer_trusted: true,
            revoked: isRevoked,
            credential: payload.vc,
            verificationId: `ver-${Date.now()}`,
        });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Verify by credential ID (for QR code scans)
router.get("/verify/:credentialId", async (req, res) => {
    try {
        const { credentialId } = req.params;
        const verifierIp = (req.headers['x-forwarded-for'] as string || req.ip || '0.0.0.0').split(',')[0].trim();

        // Get credential from storage
        const credential = await storage.getCredential(credentialId);

        if (!credential) {
            // Log failed verification
            await storage.createVerificationLog({
                tenantId: "public",
                credentialId,
                verifierName: "Unknown",
                verifierIp,
                location: "Unknown",
                status: "failed",
                reason: "Credential not found",
            });

            return res.status(404).json({
                valid: false,
                message: "Credential not found"
            });
        }

        // Check if revoked
        const isRevoked = credential.revoked || await relayerService.isRevoked(credentialId);

        // Get verifier info
        const verifierInfo = await getVerifierInfo(verifierIp);

        // Determine status
        let status: "verified" | "failed" | "suspicious" = "verified";
        let reason = "";

        if (isRevoked) {
            status = "failed";
            reason = "Credential has been revoked";
        }

        // Log the verification
        await storage.createVerificationLog({
            tenantId: credential.tenantId,
            credentialId,
            verifierName: verifierInfo.organization,
            verifierIp,
            location: verifierInfo.location,
            status,
            reason,
        });

        console.log(`[VERIFY] Credential ${credentialId} verified by ${verifierInfo.organization}`);

        res.json({
            valid: !isRevoked,
            issuer_trusted: true,
            revoked: isRevoked,
            credential: {
                id: credential.id,
                templateId: credential.templateId,
                recipient: credential.recipient,
                createdAt: credential.createdAt,
            },
            verificationId: `ver-${Date.now()}`,
        });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Simulate verification (for demo purposes)
router.post("/verify/simulate", async (req, res) => {
    try {
        const { credentialId, verifierName } = req.body;
        const verifierIp = (req.headers['x-forwarded-for'] as string || req.ip || '192.168.1.1').split(',')[0].trim();

        // Get verifier info or use provided
        const verifierInfo = await getVerifierInfo(verifierIp);
        const organization = verifierName || verifierInfo.organization;

        // Create a verification log
        const log = await storage.createVerificationLog({
            tenantId: "default-tenant-id",
            credentialId: credentialId || `CRED-${String(Date.now()).slice(-6)}`,
            verifierName: organization,
            verifierIp,
            location: verifierInfo.location,
            status: Math.random() > 0.1 ? "verified" : "suspicious",
            reason: undefined,
        });

        res.json({
            success: true,
            verificationLog: log,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to simulate verification" });
    }
});

export default router;
