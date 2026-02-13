import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { walletService } from '../services/wallet-service';
import { didService } from '../services/did-service';
import { storage } from '../storage';
import { hashPassword, optionalAuthMiddleware } from '../services/auth-service';

const router = Router();

// Sentinel: Custom middleware for demo mode & authentication enforcement
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    // 1. If user is already authenticated via optionalAuthMiddleware, proceed
    if (req.user) return next();

    // 2. Allow demo bypass ONLY in non-production with explicit flag
    if (process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEMO_ROUTES === 'true') {
        // Mock a user for demo (always user 1)
        req.user = {
            userId: 1,
            username: 'demo_user',
            role: 'holder',
            type: 'access'
        };
        return next();
    }

    // 3. Otherwise, reject
    res.status(401).json({ error: 'Authentication required' });
};

// Apply auth middleware to all routes in this router
// We use optionalAuthMiddleware first to populate req.user if token exists
router.use(optionalAuthMiddleware);

// ============== Public Routes ==============

/**
 * Resolve a DID to its document (Public)
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

// ============== Authenticated Routes ==============

// Apply strict auth check for all subsequent routes
router.use(requireAuth);

// ============== Wallet Core & Status ==============

/**
 * Initialize wallet for user (creates DID automatically)
 */
router.post('/wallet/init', async (req, res) => {
    try {
        const userId = req.user!.userId;

        // Get or create user
        let user = await storage.getUser(userId);

        if (!user) {
            // If user doesn't exist but is authenticated (e.g. via token),
            // we might need to create it in local storage if using external auth?
            // But usually userId comes from storage.
            // In this monorepo, auth-service uses storage.getUserByUsername likely.
            // If we are here, userId exists in the token.
            // But storage might be empty if in-memory and restarted?
            // Let's safe guard:
            const generatedPasswordHash = await hashPassword(crypto.randomBytes(24).toString('base64url'));
            user = await storage.createUser({
                username: req.user!.username || `user_${userId}`,
                name: 'Wallet User',
                password: generatedPasswordHash,
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
        // Sentinel: Prevent IDOR by using authenticated userId
        const userId = req.user!.userId;
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
        const userId = req.user!.userId;

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

// ============== Backup & Recovery ==============

/**
 * Create wallet backup
 */
router.post('/wallet/backup', async (req, res) => {
    try {
        // Sentinel: Prevent unauthorized backup (Account Takeover)
        const userId = req.user!.userId;
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

        // Sentinel: Ensure user is authenticated to restore
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
