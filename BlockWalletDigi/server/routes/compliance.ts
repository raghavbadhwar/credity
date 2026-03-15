import { Router } from 'express';
import { walletService } from '../services/wallet-service';

const router = Router();

function parseUserId(value: unknown): number | null {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
    }
    return parsed;
}

router.get('/compliance/consents', async (req, res) => {
    try {
        const userId = parseUserId(req.query.userId);
        if (!userId) {
            return res.status(400).json({ error: 'valid userId is required' });
        }

        const consents = await walletService.listConsentGrants(userId);
        res.json({ count: consents.length, consents });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ error: error?.message || 'Failed to list consents' });
    }
});

router.post('/compliance/consents', async (req, res) => {
    try {
        const userId = parseUserId(req.body?.userId);
        const verifierId = typeof req.body?.verifierId === 'string' ? req.body.verifierId.trim() : '';
        const purpose = typeof req.body?.purpose === 'string' ? req.body.purpose.trim() : '';
        const dataElements = Array.isArray(req.body?.dataElements) ? req.body.dataElements.filter((v: unknown) => typeof v === 'string') : [];
        const expiry = typeof req.body?.expiry === 'string' ? req.body.expiry : '';

        if (!userId || !verifierId || !purpose || dataElements.length === 0 || !expiry) {
            return res.status(400).json({
                error: 'userId, verifierId, purpose, dataElements[], and expiry are required',
            });
        }

        const parsedExpiry = new Date(expiry);
        if (Number.isNaN(parsedExpiry.getTime())) {
            return res.status(400).json({ error: 'expiry must be an ISO datetime string' });
        }

        const consent = await walletService.createConsentGrant(userId, {
            verifierId,
            purpose,
            dataElements,
            expiry: parsedExpiry.toISOString(),
            consentProof: typeof req.body?.consentProof === 'object' && req.body.consentProof
                ? req.body.consentProof
                : undefined,
        });

        res.status(201).json(consent);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ error: error?.message || 'Failed to create consent grant' });
    }
});

router.post('/compliance/consents/:consentId/revoke', async (req, res) => {
    try {
        const userId = parseUserId(req.body?.userId ?? req.query.userId);
        if (!userId) {
            return res.status(400).json({ error: 'valid userId is required' });
        }

        const revoked = await walletService.revokeConsentGrant(userId, req.params.consentId);
        if (!revoked) {
            return res.status(404).json({ error: 'consent grant not found' });
        }

        res.json(revoked);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ error: error?.message || 'Failed to revoke consent grant' });
    }
});

router.get('/compliance/data-requests', async (req, res) => {
    try {
        const userId = parseUserId(req.query.userId);
        if (!userId) {
            return res.status(400).json({ error: 'valid userId is required' });
        }

        const requests = await walletService.listDataRequests(userId);
        res.json({ count: requests.length, requests });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ error: error?.message || 'Failed to list data requests' });
    }
});

router.post('/compliance/data-requests/export', async (req, res) => {
    try {
        const userId = parseUserId(req.body?.userId);
        if (!userId) {
            return res.status(400).json({ error: 'valid userId is required' });
        }

        const request = await walletService.submitDataRequest(userId, {
            type: 'export',
            reason: typeof req.body?.reason === 'string' ? req.body.reason : undefined,
        });

        res.status(202).json(request);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ error: error?.message || 'Failed to submit export request' });
    }
});

router.post('/compliance/data-requests/delete', async (req, res) => {
    try {
        const userId = parseUserId(req.body?.userId);
        if (!userId) {
            return res.status(400).json({ error: 'valid userId is required' });
        }
        if (req.body?.confirm !== 'DELETE') {
            return res.status(400).json({ error: 'confirm must be set to DELETE' });
        }

        const request = await walletService.submitDataRequest(userId, {
            type: 'delete',
            reason: typeof req.body?.reason === 'string' ? req.body.reason : undefined,
        });

        res.status(202).json(request);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ error: error?.message || 'Failed to submit delete request' });
    }
});

router.get('/compliance/certin/incidents', async (_req, res) => {
    try {
        const incidents = await walletService.listCertInIncidents();
        res.json({ count: incidents.length, incidents });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ error: error?.message || 'Failed to list incidents' });
    }
});

router.post('/compliance/certin/incidents', async (req, res) => {
    try {
        const category = typeof req.body?.category === 'string' ? req.body.category.trim() : '';
        const severity = typeof req.body?.severity === 'string' ? req.body.severity.toLowerCase() : '';
        if (!category || !['low', 'medium', 'high', 'critical'].includes(severity)) {
            return res.status(400).json({ error: 'category and severity (low|medium|high|critical) are required' });
        }

        const incident = await walletService.createCertInIncident({
            category,
            severity: severity as 'low' | 'medium' | 'high' | 'critical',
            detectedAt: typeof req.body?.detectedAt === 'string' ? req.body.detectedAt : undefined,
            metadata: typeof req.body?.metadata === 'object' && req.body.metadata ? req.body.metadata : undefined,
        });

        res.status(201).json(incident);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ error: error?.message || 'Failed to create incident record' });
    }
});

export default router;
