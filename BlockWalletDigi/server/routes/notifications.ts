import { Router } from 'express';
import { walletService } from '../services/wallet-service';
import { storage } from '../storage';
import {
    pushCredentialToWallet,
    getPendingCredentials,
    acceptCredentialOffer,
    rejectCredentialOffer,
    getCredentialOffer,
    registerWebhook,
} from '../services/credential-push-service';
import { authMiddleware } from '../services/auth-service';

const router = Router();

// ============== Inbox & Push ==============

/**
 * Get pending credential offers for wallet
 */
router.get('/inbox', authMiddleware, async (req, res) => {
    try {
        const userId = req.user!.userId;

        // Get user's DID
        const wallet = await walletService.getOrCreateWallet(userId, '');
        if (!wallet?.did) {
            return res.status(400).json({ error: 'Wallet not initialized' });
        }

        const pending = getPendingCredentials(wallet.did);

        res.json({
            offers: pending.map(p => ({
                id: p.id,
                issuer: p.issuerName,
                preview: p.credentialPreview,
                createdAt: p.createdAt,
                expiresAt: p.expiresAt,
            })),
            count: pending.length,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Accept a credential offer
 */
router.post('/inbox/:offerId/accept', authMiddleware, async (req, res) => {
    try {
        const { offerId } = req.params;
        const userId = req.user!.userId;

        // Get user's DID
        const wallet = await walletService.getOrCreateWallet(userId, '');
        if (!wallet?.did) {
            return res.status(400).json({ error: 'Wallet not initialized' });
        }

        const result = acceptCredentialOffer(offerId, wallet.did);

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        // Store the credential in wallet
        const credential = await walletService.storeCredential(userId, {
            type: result.credential.type,
            issuer: result.credential.issuer,
            issuanceDate: new Date(result.credential.issuanceDate),
            data: result.credential.data,
            category: result.credential.category || 'other',
        });

        res.json({
            success: true,
            credential: {
                id: credential.id,
                type: credential.type,
                issuer: credential.issuer,
            },
        });
    } catch (error: any) {
        console.error('Accept offer error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Reject a credential offer
 */
router.post('/inbox/:offerId/reject', authMiddleware, async (req, res) => {
    try {
        const { offerId } = req.params;
        const userId = req.user!.userId;

        const wallet = await walletService.getOrCreateWallet(userId, '');
        if (!wallet?.did) {
            return res.status(400).json({ error: 'Wallet not initialized' });
        }

        const success = rejectCredentialOffer(offerId, wallet.did);

        res.json({ success });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get details of a specific offer
 */
router.get('/inbox/:offerId', authMiddleware, async (req, res) => {
    try {
        const { offerId } = req.params;
        const userId = req.user!.userId;

        const wallet = await walletService.getOrCreateWallet(userId, '');
        const offer = getCredentialOffer(offerId);

        if (!offer) {
            return res.status(404).json({ error: 'Offer not found' });
        }

        if (offer.recipientDid !== wallet?.did) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        res.json({
            id: offer.id,
            issuer: offer.issuerName,
            preview: offer.credentialPreview,
            status: offer.status,
            createdAt: offer.createdAt,
            expiresAt: offer.expiresAt,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Register webhook for push notifications
 */
router.post('/webhook/register', authMiddleware, async (req, res) => {
    try {
        const userId = req.user!.userId;
        const { webhookUrl, events } = req.body;

        const wallet = await walletService.getOrCreateWallet(userId, '');
        if (!wallet?.did) {
            return res.status(400).json({ error: 'Wallet not initialized' });
        }

        const secret = registerWebhook(wallet.did, webhookUrl, events);

        res.json({
            success: true,
            secret,
            message: 'Webhook registered. Include X-CredVerse-Signature header with HMAC-SHA256 verification.',
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Push credential to wallet (called by issuers)
 */
router.post('/push', async (req, res) => {
    try {
        const {
            issuerId,
            issuerName,
            recipientDid,
            recipientEmail,
            credential,
            expiryHours,
        } = req.body;

        if (!issuerId || !issuerName || !recipientDid || !credential) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await pushCredentialToWallet(
            issuerId,
            issuerName,
            recipientDid,
            credential,
            { recipientEmail, expiryHours }
        );

        res.json({
            success: true,
            offerId: result.offerId,
            status: result.status,
            message: 'Credential offer sent to wallet',
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ============== Notifications & Activity ==============

/**
 * Get notifications
 */
router.get('/wallet/notifications', authMiddleware, async (req, res) => {
    try {
        const userId = req.user!.userId;
        const notifications = await walletService.getNotifications(userId);

        res.json({
            notifications,
            unreadCount: notifications.filter(n => !n.read).length,
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to get notifications' });
    }
});

/**
 * Mark notification as read
 */
router.post('/wallet/notifications/:id/read', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user!.userId;

        await walletService.markNotificationRead(userId, id);

        res.json({ success: true });
    } catch (error) {
        console.error('Mark notification error:', error);
        res.status(500).json({ error: 'Failed to mark notification' });
    }
});

/**
 * Get activity feed
 */
router.get('/activity', authMiddleware, async (req, res) => {
    try {
        const userId = req.user!.userId;
        const activities = await storage.listActivities(userId);
        res.json(activities);
    } catch (error) {
        console.error('Error listing activities:', error);
        res.status(500).json({ error: 'Failed to list activities' });
    }
});

export default router;
