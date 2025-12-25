import { Router } from 'express';
import { walletService } from '../services/wallet-service';
import { didService } from '../services/did-service';
import { storage } from '../storage';

const router = Router();

// ============== Wallet Core & Status ==============

/**
 * Initialize wallet for user (creates DID automatically)
 */
router.post('/wallet/init', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId required' });

        // Get or create user
        let user = await storage.getUser(userId);

        if (!user) {
            user = await storage.createUser({
                username: `user_${userId}`,
                name: 'Wallet User',
                password: 'wallet-auto-generated', // Auto-init wallets use passkey/DID auth
            });
        }

        let did = user?.did;

        if (!did) {
            const didKeyPair = await didService.createDID();
            did = didKeyPair.did;
            await storage.updateUser(user.id, { did });
        }

        // Initialize wallet
        await walletService.getOrCreateWallet(user.id, did);
        const stats = await walletService.getWalletStats(user.id);

        res.json({
            success: true,
            wallet: {
                did: did,
                credentialCount: stats.totalCredentials,
                initialized: true,
            },
            stats,
        });
    } catch (error) {
        console.error('Wallet init error:', error);
        res.status(500).json({ error: 'Failed to initialize wallet' });
    }
});

/**
 * Get wallet status
 */
router.get('/wallet/status', async (req, res) => {
    try {
        const userId = parseInt(req.query.userId as string) || 1;
        const wallet = await walletService.getOrCreateWallet(userId);
        const stats = await walletService.getWalletStats(userId);

        res.json({
            did: wallet.did,
            stats,
            lastSync: wallet.lastSync,
        });
    } catch (error) {
        console.error('Wallet status error:', error);
        res.status(500).json({ error: 'Failed to get wallet status' });
    }
});

// ============== DID Management ==============

/**
 * Create a new DID for user (Manual)
 */
router.post('/did/create', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        // Create new DID
        const didKeyPair = await didService.createDID();

        // Update user with DID
        const user = await storage.getUser(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await storage.updateUser(userId, { did: didKeyPair.did });

        // Log activity
        await storage.createActivity({
            userId,
            type: 'did_created',
            description: `DID created: ${didKeyPair.did.slice(0, 30)}...`,
        });

        res.json({
            success: true,
            did: didKeyPair.did,
            message: 'DID created successfully',
        });
    } catch (error) {
        console.error('Error creating DID:', error);
        res.status(500).json({ error: 'Failed to create DID' });
    }
});

/**
 * Resolve a DID to its document
 */
router.get('/did/resolve/:did', async (req, res) => {
    try {
        const { did } = req.params;
        const result = await didService.resolveDID(decodeURIComponent(did));

        if (result.didResolutionMetadata.error) {
            return res.status(400).json({ error: result.didResolutionMetadata.error });
        }

        res.json(result);
    } catch (error) {
        console.error('Error resolving DID:', error);
        res.status(500).json({ error: 'Failed to resolve DID' });
    }
});

// ============== Backup & Recovery ==============

/**
 * Create wallet backup
 */
router.post('/wallet/backup', async (req, res) => {
    try {
        const userId = parseInt(req.body.userId) || 1;
        const { backupData, backupKey } = await walletService.createBackup(userId);

        await storage.createActivity({
            userId,
            type: 'backup_created',
            description: 'Wallet backup created',
        });

        res.json({
            success: true,
            backupData,
            backupKey,
            warning: 'Store your backup key securely. It cannot be recovered.',
        });
    } catch (error) {
        console.error('Create backup error:', error);
        res.status(500).json({ error: 'Failed to create backup' });
    }
});

/**
 * Restore from backup
 */
router.post('/wallet/restore', async (req, res) => {
    try {
        const { backupData, backupKey } = req.body;

        if (!backupData || !backupKey) {
            return res.status(400).json({ error: 'backupData and backupKey required' });
        }

        const wallet = await walletService.restoreFromBackup(backupData, backupKey);

        res.json({
            success: true,
            message: 'Wallet restored successfully',
            credentialsRestored: wallet.credentials.length,
        });
    } catch (error) {
        console.error('Restore backup error:', error);
        res.status(500).json({ error: 'Failed to restore backup. Check your backup key.' });
    }
});

export default router;
