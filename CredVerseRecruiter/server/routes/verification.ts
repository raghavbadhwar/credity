import { Router } from 'express';
import { verificationEngine } from '../services/verification-engine';
import { fraudDetector } from '../services/fraud-detector';
import { storage, VerificationRecord } from '../storage';

const router = Router();

/**
 * Validate and sanitize verifier name
 */
function validateVerifierName(name: any): string {
    if (typeof name !== 'string') {
        return 'Anonymous Recruiter';
    }
    const trimmed = name.trim();
    if (trimmed.length === 0 || trimmed.length > 100) {
        return 'Anonymous Recruiter';
    }
    // Remove any HTML/script tags for XSS prevention
    return trimmed.replace(/<[^>]*>/g, '');
}

/**
 * Validate credential size to prevent DoS
 */
function validateCredentialSize(credential: any): boolean {
    const size = JSON.stringify(credential).length;
    return size <= 1024 * 1024; // 1MB limit
}

// ============== Instant Verification ==============

/**
 * Verify a single credential (JWT, QR, or raw)
 */
router.post('/verify/instant', async (req, res) => {
    try {
        const { jwt, qrData, credential, verifiedBy = 'Anonymous Recruiter' } = req.body;

        if (!jwt && !qrData && !credential) {
            return res.status(400).json({
                error: 'Provide jwt, qrData, or credential object'
            });
        }

        // Validate credential size
        if (credential && !validateCredentialSize(credential)) {
            return res.status(400).json({
                error: 'Credential size exceeds maximum limit'
            });
        }

        // Validate JWT format
        if (jwt && typeof jwt !== 'string') {
            return res.status(400).json({ error: 'JWT must be a string' });
        }

        // Validate QR data format
        if (qrData && typeof qrData !== 'string') {
            return res.status(400).json({ error: 'QR data must be a string' });
        }

        const sanitizedVerifier = validateVerifierName(verifiedBy);

        // Run verification
        const verificationResult = await verificationEngine.verifyCredential({
            jwt,
            qrData,
            raw: credential,
        });

        // Run fraud analysis
        const credentialData = credential || (jwt ? JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString()) : null);
        const fraudAnalysis = credentialData
            ? await fraudDetector.analyzeCredential(credentialData)
            : { score: 0, flags: [], recommendation: 'review', details: [] };

        // Store in history
        const record: VerificationRecord = {
            id: verificationResult.verificationId,
            credentialType: credentialData?.type?.[0] || 'Unknown',
            issuer: credentialData?.issuer || 'Unknown',
            subject: credentialData?.credentialSubject?.name || 'Unknown',
            status: verificationResult.status,
            riskScore: verificationResult.riskScore,
            fraudScore: fraudAnalysis.score,
            recommendation: fraudAnalysis.recommendation,
            timestamp: new Date(),
            verifiedBy: sanitizedVerifier,
        };
        await storage.addVerification(record);

        res.json({
            success: true,
            verification: verificationResult,
            fraud: fraudAnalysis,
            record,
        });
    } catch (error) {
        console.error('Instant verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

/**
 * Verify via QR scan (simplified endpoint)
 */
router.post('/verify/qr', async (req, res) => {
    try {
        const { qrData } = req.body;

        if (!qrData || typeof qrData !== 'string') {
            return res.status(400).json({ error: 'qrData string is required' });
        }

        // Limit QR data size
        if (qrData.length > 10000) {
            return res.status(400).json({ error: 'QR data size exceeds maximum limit' });
        }

        // Parse QR and extract verification token
        let parsedData;
        try {
            parsedData = JSON.parse(qrData);
        } catch {
            try {
                parsedData = JSON.parse(Buffer.from(qrData, 'base64').toString());
            } catch {
                return res.status(400).json({ error: 'Invalid QR data format' });
            }
        }

        const verificationResult = await verificationEngine.verifyCredential({
            qrData: JSON.stringify(parsedData),
        });

        res.json({
            success: true,
            verification: verificationResult,
        });
    } catch (error) {
        console.error('QR verification error:', error);
        res.status(500).json({ error: 'QR verification failed' });
    }
});

// ============== Bulk Verification ==============

/**
 * Bulk verify credentials from array
 */
router.post('/verify/bulk', async (req, res) => {
    try {
        const { credentials } = req.body;

        if (!credentials || !Array.isArray(credentials)) {
            return res.status(400).json({ error: 'credentials array is required' });
        }

        if (credentials.length > 100) {
            return res.status(400).json({ error: 'Maximum 100 credentials per batch' });
        }

        const payloads = credentials.map(cred => ({
            jwt: cred.jwt,
            qrData: cred.qrData,
            raw: cred.credential || cred,
        }));

        const bulkResult = await verificationEngine.bulkVerify(payloads);

        res.json({
            success: true,
            result: bulkResult,
        });
    } catch (error) {
        console.error('Bulk verification error:', error);
        res.status(500).json({ error: 'Bulk verification failed' });
    }
});

/**
 * Get bulk job status
 */
router.get('/verify/bulk/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;
        const result = verificationEngine.getBulkJobResult(jobId);

        if (!result) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json({ success: true, result });
    } catch (error) {
        console.error('Get bulk job error:', error);
        res.status(500).json({ error: 'Failed to get job status' });
    }
});

// ============== Simulate Verifications (Demo) ==============

/**
 * Simulate a verification for demo purposes
 */
router.post('/verify/simulate', async (req, res) => {
    try {
        // Generate realistic sample credential
        const issuers = [
            'Stanford University',
            'Delhi University',
            'IIT Bombay',
            'Harvard University',
            'MIT',
            'Unknown Institution',
        ];

        const names = [
            'Arjun Sharma',
            'Priya Patel',
            'John Smith',
            'Maria Garcia',
            'Wei Zhang',
        ];

        const degrees = [
            'Bachelor of Computer Science',
            'Master of Business Administration',
            'Bachelor of Engineering',
            'Doctor of Philosophy',
        ];

        const randomIssuer = issuers[Math.floor(Math.random() * issuers.length)];
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomDegree = degrees[Math.floor(Math.random() * degrees.length)];

        const sampleCredential = {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential', 'UniversityDegreeCredential'],
            issuer: randomIssuer,
            issuanceDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            credentialSubject: {
                id: `did:key:z6Mk${Math.random().toString(36).slice(2, 10)}`,
                name: randomName,
                degree: randomDegree,
                graduationYear: 2020 + Math.floor(Math.random() * 4),
            },
            proof: {
                type: 'Ed25519Signature2020',
                created: new Date().toISOString(),
                proofValue: 'simulated-proof',
            },
        };

        const verificationResult = await verificationEngine.verifyCredential({
            raw: sampleCredential,
        });

        const fraudAnalysis = await fraudDetector.analyzeCredential(sampleCredential);

        const record: VerificationRecord = {
            id: verificationResult.verificationId,
            credentialType: 'UniversityDegreeCredential',
            issuer: randomIssuer,
            subject: randomName,
            status: verificationResult.status,
            riskScore: verificationResult.riskScore,
            fraudScore: fraudAnalysis.score,
            recommendation: fraudAnalysis.recommendation,
            timestamp: new Date(),
            verifiedBy: 'Demo User',
        };
        await storage.addVerification(record);

        res.json({
            success: true,
            message: 'Simulated verification created',
            verification: verificationResult,
            fraud: fraudAnalysis,
            record,
        });
    } catch (error) {
        console.error('Simulate verification error:', error);
        res.status(500).json({ error: 'Simulation failed' });
    }
});

export default router;
