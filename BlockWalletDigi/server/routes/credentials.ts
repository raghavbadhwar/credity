import { Router } from 'express';
import { walletService } from '../services/wallet-service';
import { storage } from '../storage';
import { insertCredentialSchema } from "@shared/schema";

const router = Router();

// ============== Credential Management ==============

/**
 * List all credentials
 */
router.get('/wallet/credentials', async (req, res) => {
    try {
        const userId = parseInt(req.query.userId as string) || 1;
        const category = req.query.category as string;

        let credentials;
        if (category) {
            credentials = await walletService.getCredentialsByCategory(userId, category);
        } else {
            credentials = await walletService.getCredentials(userId);
        }

        res.json({ credentials });
    } catch (error) {
        console.error('Get credentials error:', error);
        res.status(500).json({ error: 'Failed to get credentials' });
    }
});

/**
 * Get single credential details
 */
router.get('/wallet/credentials/:id', async (req, res) => {
    try {
        const userId = parseInt(req.query.userId as string) || 1;
        const { id } = req.params;

        const credentials = await walletService.getCredentials(userId);
        const credential = credentials.find(c => c.id === id);

        if (!credential) {
            return res.status(404).json({ error: 'Credential not found' });
        }

        // Get share history for this credential
        const shares = await walletService.getShareHistory(userId, id);
        const consentLogs = await walletService.getConsentLogs(userId, id);

        res.json({
            credential,
            shares,
            consentLogs,
            verificationCount: credential.verificationCount,
        });
    } catch (error) {
        console.error('Get credential error:', error);
        res.status(500).json({ error: 'Failed to get credential' });
    }
});

/**
 * Store a new credential
 */
router.post('/wallet/credentials', async (req, res) => {
    try {
        const { userId, credential } = req.body;
        if (!userId || !credential) {
            return res.status(400).json({ error: 'userId and credential required' });
        }

        const stored = await walletService.storeCredential(userId, {
            type: credential.type || ['VerifiableCredential'],
            issuer: credential.issuer || 'Unknown',
            issuanceDate: new Date(credential.issuanceDate || Date.now()),
            expirationDate: credential.expirationDate ? new Date(credential.expirationDate) : undefined,
            data: credential.data || credential,
            jwt: credential.jwt,
            category: credential.category,
        });

        // Also store in legacy storage for dashboard compatibility
        try {
            await storage.createCredential({
                userId,
                type: stored.type,
                issuer: stored.issuer,
                issuanceDate: stored.issuanceDate,
                data: stored.data,
                jwt: stored.jwt,
            });
        } catch (e) {
            // Ignore duplication error if any
        }

        // Log activity
        await storage.createActivity({
            userId,
            type: 'credential_stored',
            description: `Stored ${stored.type[0]} from ${stored.issuer}`,
        });

        res.json({ success: true, credential: stored });
    } catch (error) {
        console.error('Store credential error:', error);
        res.status(500).json({ error: 'Failed to store credential' });
    }
});

/**
 * Import a credential (VC-JWT)
 */
router.post('/credentials/import', async (req, res) => {
    try {
        const { userId, jwt: vcJwt, type, issuer, data } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        // In production, we would decode and validate the VC-JWT
        // For MVP, we accept the credential data directly
        const credential = await storage.createCredential({
            userId,
            type: type || ['VerifiableCredential'],
            issuer: issuer || 'Unknown Issuer',
            issuanceDate: new Date(),
            data: data || {},
            jwt: vcJwt,
        });

        // Log activity
        await storage.createActivity({
            userId,
            type: 'credential_imported',
            description: `Imported credential from ${issuer || 'Unknown Issuer'}`,
        });

        res.json({
            success: true,
            credential,
            message: 'Credential imported successfully',
        });
    } catch (error) {
        console.error('Error importing credential:', error);
        res.status(500).json({ error: 'Failed to import credential' });
    }
});
// ... import endpoint ...

/**
 * Claim a credential from an Offer URL
 */
router.post('/wallet/offer/claim', async (req, res) => {
    try {
        const { userId, url } = req.body;
        if (!userId || !url) {
            return res.status(400).json({ error: 'userId and url required' });
        }

        console.log(`[Wallet] Claiming offer from: ${url}`);

        // Fetch credential from Issuer
        const response = await fetch(url);
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Failed to fetch offer: ${response.status} ${errText}`);
        }

        const data = await response.json();
        // Expected format: { credential: { ... }, vcJwt: string }

        if (!data.credential || !data.vcJwt) {
            throw new Error("Invalid response format from Issuer");
        }

        const credData = data.credential;

        // Store in wallet
        const stored = await walletService.storeCredential(userId, {
            type: ['VerifiableCredential', 'Imported'], // Could parse from VC payload
            issuer: credData.issuerId || 'External Issuer',
            issuanceDate: new Date(),
            data: credData.credentialData || {},
            jwt: data.vcJwt,
            category: 'other' // Default category
        });

        // Log activity
        await storage.createActivity({
            userId,
            type: 'credential_imported',
            description: `Claimed credential via Offer`,
        });

        res.json({
            success: true,
            credential: stored,
            message: 'Credential claimed successfully'
        });

    } catch (error: any) {
        console.error('[Wallet] Claim offer error:', error);
        res.status(500).json({ error: error.message || 'Failed to claim offer' });
    }
});
// ============== Demo Data ==============

/**
 * Add sample credentials for demo
 */
router.post('/wallet/demo/populate', async (req, res) => {
    try {
        const userId = parseInt(req.body.userId) || 1;

        // Add sample credentials
        const sampleCredentials = [
            {
                type: ['VerifiableCredential', 'UniversityDegree'],
                issuer: 'Stanford University',
                issuanceDate: new Date('2023-05-15'),
                data: {
                    name: 'Bachelor of Computer Science',
                    recipient: 'John Doe',
                    graduationDate: '2023-05-15',
                    gpa: '3.8',
                    honors: 'Magna Cum Laude',
                },
                category: 'academic',
            },
            {
                type: ['VerifiableCredential', 'EmploymentCertificate'],
                issuer: 'Google LLC',
                issuanceDate: new Date('2023-08-01'),
                data: {
                    name: 'Software Engineer',
                    recipient: 'John Doe',
                    startDate: '2023-08-01',
                    department: 'Cloud Platform',
                    level: 'L4',
                },
                category: 'employment',
            },
            {
                type: ['VerifiableCredential', 'SkillBadge'],
                issuer: 'AWS',
                issuanceDate: new Date('2024-01-10'),
                data: {
                    name: 'AWS Solutions Architect - Professional',
                    recipient: 'John Doe',
                    validUntil: '2027-01-10',
                    score: '920/1000',
                },
                category: 'skill',
            },
        ];

        for (const cred of sampleCredentials) {
            await walletService.storeCredential(userId, cred as any);
        }

        const stats = await walletService.getWalletStats(userId);

        res.json({
            success: true,
            message: 'Demo credentials added',
            stats,
        });
    } catch (error) {
        console.error('Populate demo error:', error);
        res.status(500).json({ error: 'Failed to populate demo data' });
    }
});

export default router;
