import { Router } from 'express';
import { verificationEngine } from '../services/verification-engine';
import { fraudDetector } from '../services/fraud-detector';
import { storage, VerificationRecord } from '../storage';

const router = Router();

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
            verifiedBy,
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

        if (!qrData) {
            return res.status(400).json({ error: 'qrData is required' });
        }

        // Parse QR and extract verification token
        let parsedData;
        try {
            parsedData = JSON.parse(qrData);
        } catch {
            parsedData = JSON.parse(Buffer.from(qrData, 'base64').toString());
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

    const verificationResult = await verificationEngine.verifyCredential({ raw: sampleCredential });
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
});





// New route: Verify credential via link URL
router.post('/verify/link', async (req, res) => {
    try {
        const { link } = req.body;
        if (!link) {
            return res.status(400).json({ error: 'Link URL is required' });
        }
        // Fetch credential from the provided URL (expects JSON)
        const response = await fetch(link);
        if (!response.ok) {
            return res.status(400).json({ error: `Failed to fetch credential from link (status ${response.status})` });
        }
        const payload = await response.json();

        let verificationResult;
        let credentialData;

        // Handle wrapper response (from Issuer offer/consume) which often contains vcJwt or a credential object
        if (payload.vcJwt) {
            verificationResult = await verificationEngine.verifyCredential({ jwt: payload.vcJwt });
            // Parse JWT for fraud/storage
            const parts = payload.vcJwt.split('.');
            if (parts.length === 3) {
                const decoded = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
                // If it's a VC JWT, the credential data is usually in 'vc' claim
                credentialData = decoded.vc || decoded;
            }
        } else if (payload.credential) {
            verificationResult = await verificationEngine.verifyCredential({ raw: payload.credential });
            credentialData = payload.credential;
        } else {
            // Fallback to raw payload (if it's a direct VC)
            verificationResult = await verificationEngine.verifyCredential({ raw: payload });
            credentialData = payload;
        }

        if (!credentialData) credentialData = {};

        // Run fraud analysis on the fetched credential data
        const fraudAnalysis = await fraudDetector.analyzeCredential(credentialData);
        // Store verification record
        const record: VerificationRecord = {
            id: verificationResult.verificationId,
            credentialType: credentialData.type?.[0] || 'Unknown',
            issuer: credentialData.issuer?.name || credentialData.issuer || 'Unknown',
            subject: credentialData.credentialSubject?.name || 'Unknown',
            status: verificationResult.status,
            riskScore: verificationResult.riskScore,
            fraudScore: fraudAnalysis.score,
            recommendation: fraudAnalysis.recommendation,
            timestamp: new Date(),
            verifiedBy: 'Link Verification',
        };
        await storage.addVerification(record);
        res.json({ success: true, verification: verificationResult, fraud: fraudAnalysis, record });
    } catch (error) {
        console.error('Link verification error:', error);
        res.status(500).json({ error: 'Link verification failed' });
    }
});

export default router;
