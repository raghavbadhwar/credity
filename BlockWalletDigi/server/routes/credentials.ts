import { Router } from 'express';
import { walletService } from '../services/wallet-service';
import { storage } from '../storage';
import { insertCredentialSchema } from "@shared/schema";
import { authMiddleware } from '../services/auth-service';

// Allowed hosts for SSRF protection - empty by default in production to require explicit configuration
const DEFAULT_ALLOWED_HOSTS = process.env.NODE_ENV === 'production' ? '' : 'localhost,127.0.0.1';
const ALLOWED_ISSUER_HOSTS = (process.env.ALLOWED_ISSUER_HOSTS || DEFAULT_ALLOWED_HOSTS).split(',').map(h => h.trim().toLowerCase()).filter(h => h.length > 0);

function isAllowedUrl(urlString: string): boolean {
    try {
        // In production, ALLOWED_ISSUER_HOSTS must be explicitly configured
        if (process.env.NODE_ENV === 'production' && ALLOWED_ISSUER_HOSTS.length === 0) {
            console.error('[Security] ALLOWED_ISSUER_HOSTS not configured in production');
            return false;
        }

        const url = new URL(urlString);
        const hostname = url.hostname.toLowerCase();
        
        // Block internal/private IP ranges
        const blockedPatterns = [
            /^10\./,                    // 10.0.0.0/8
            /^172\.(1[6-9]|2[0-9]|3[01])\./, // 172.16.0.0/12
            /^192\.168\./,              // 192.168.0.0/16
            /^169\.254\./,              // Link-local
            /^127\./,                   // Loopback (in production)
            /^0\./,                     // This network
        ];

        // In production, block internal IP ranges
        if (process.env.NODE_ENV === 'production') {
            if (blockedPatterns.some(pattern => pattern.test(hostname))) {
                console.warn(`[Security] Blocked internal IP access attempt: ${hostname}`);
                return false;
            }
            // Only allow HTTPS in production
            if (url.protocol !== 'https:') {
                return false;
            }
        }
        
        return ALLOWED_ISSUER_HOSTS.some(allowed => 
            hostname === allowed || hostname.endsWith('.' + allowed)
        );
    } catch {
        return false;
    }
}

const router = Router();

// ============== Credential Management ==============

/**
 * List all credentials
 */
router.get('/wallet/credentials', authMiddleware, async (req, res) => {
    try {
        const userId = req.user!.userId;
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
router.get('/wallet/credentials/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user!.userId;
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
router.post('/wallet/credentials', authMiddleware, async (req, res) => {
    try {
        const userId = req.user!.userId;
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ error: 'credential required' });
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
router.post('/credentials/import', authMiddleware, async (req, res) => {
    try {
        const userId = req.user!.userId;
        const { jwt: vcJwt, type, issuer, data } = req.body;

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

/**
 * Claim a credential from an Offer URL
 */
router.post('/wallet/offer/claim', authMiddleware, async (req, res) => {
    try {
        const userId = req.user!.userId;
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'url required' });
        }

        // SSRF Protection: Validate URL against allowlist
        if (!isAllowedUrl(url)) {
            return res.status(400).json({ error: 'URL not allowed. Only trusted issuer domains are permitted.' });
        }

        console.log(`[Wallet] Claiming offer from: ${url}`);

        // Fetch credential from Issuer with timeout (configurable, default 5s)
        const timeoutMs = parseInt(process.env.CREDENTIAL_FETCH_TIMEOUT_MS || '5000', 10);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

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
        } catch (fetchError: any) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
                throw new Error('Request timeout while fetching offer');
            }
            throw fetchError;
        }

    } catch (error: any) {
        console.error('[Wallet] Claim offer error:', error);
        res.status(500).json({ error: error.message || 'Failed to claim offer' });
    }
});

// ============== Demo Data ==============

/**
 * Add sample credentials for demo
 */
router.post('/wallet/demo/populate', authMiddleware, async (req, res) => {
    try {
        const userId = req.user!.userId;

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
