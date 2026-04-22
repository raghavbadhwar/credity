import { Router } from "express";
import { storage } from "../storage";
import { digilockerService } from "../services/digilocker-service";
import { walletService } from "../services/wallet-service";

const router = Router();
const allowDemoRoutes =
    process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEMO_ROUTES === 'true';

/**
 * Get authorization URL for DigiLocker OAuth flow
 */
router.get("/digilocker/auth", async (req, res) => {
    try {
        const userId = parseInt(req.query.userId as string) || 1;

        const { url, state } = digilockerService.getAuthorizationUrl(userId);

        res.json({
            authUrl: url,
            state,
            isDemoMode: digilockerService.isDemoMode(),
        });
    } catch (error: any) {
        console.error('[DigiLocker] Auth URL error:', error);
        if (String(error?.message || '').includes('not configured')) {
            return res.status(503).json({ error: 'DigiLocker is not configured for this environment' });
        }
        res.status(500).json({ error: error.message });
    }
});

/**
 * OAuth callback - exchange code for tokens
 */
router.get("/digilocker/callback", async (req, res) => {
    try {
        const { code, state, error } = req.query;

        if (error) {
            // Redirect to frontend with error
            return res.redirect(`/connect-digilocker?error=${encodeURIComponent(error as string)}`);
        }

        if (!code || !state) {
            return res.redirect('/connect-digilocker?error=missing_params');
        }

        // Exchange code for tokens
        const tokens = await digilockerService.exchangeCodeForTokens(
            code as string,
            state as string
        );

        // Redirect to frontend with success
        res.redirect(`/connect-digilocker?connected=true&digilocker_id=${tokens.digilocker_id || ''}`);
    } catch (error: any) {
        console.error('[DigiLocker] Callback error:', error);
        res.redirect(`/connect-digilocker?error=${encodeURIComponent(error.message)}`);
    }
});

/**
 * Check connection status
 */
router.get("/digilocker/status", async (req, res) => {
    try {
        const userId = parseInt(req.query.userId as string) || 1;

        const isConnected = digilockerService.isConnected(userId);

        if (isConnected) {
            const userInfo = await digilockerService.getUserInfo(userId);
            res.json({
                connected: true,
                user: userInfo,
                isDemoMode: digilockerService.isDemoMode(),
            });
        } else {
            res.json({ connected: false });
        }
    } catch (error: any) {
        res.json({ connected: false, error: error.message });
    }
});

/**
 * List available documents from DigiLocker
 */
router.get("/digilocker/documents", async (req, res) => {
    try {
        const userId = parseInt(req.query.userId as string) || 1;

        if (!digilockerService.isConnected(userId)) {
            return res.status(401).json({ error: 'Not connected to DigiLocker' });
        }

        const documents = await digilockerService.listDocuments(userId);

        res.json({ documents });
    } catch (error: any) {
        console.error('[DigiLocker] List documents error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Import a specific document from DigiLocker to wallet
 */
router.post("/digilocker/import", async (req, res) => {
    try {
        const userId = parseInt(req.body.userId) || 1;
        const { documentUri, documentType, documentName, issuer } = req.body;

        if (!digilockerService.isConnected(userId)) {
            return res.status(401).json({ error: 'Not connected to DigiLocker' });
        }

        // Pull document data from DigiLocker
        const { document } = await digilockerService.pullDocument(userId, documentUri);

        // Determine category based on document type
        const categoryMap: Record<string, string> = {
            'ADHAR': 'government',
            'PAN': 'government',
            'DRVLC': 'government',
            'CLASS10': 'academic',
            'CLASS12': 'academic',
            'DEGREE': 'academic',
        };

        // Store in wallet as verified credential
        const credential = await walletService.storeCredential(userId, {
            type: ['VerifiableCredential', documentType, 'DigiLockerDocument'],
            issuer: issuer || 'DigiLocker',
            issuanceDate: new Date(),
            data: {
                name: documentName,
                source: 'DigiLocker',
                uri: documentUri,
                ...document,
            },
            category: categoryMap[documentType] || 'government',
        });

        // Log activity
        await storage.createActivity({
            userId,
            type: "import",
            description: `Imported ${documentName} from DigiLocker`,
        });

        res.json({
            success: true,
            credential,
            message: `${documentName} imported successfully`,
        });
    } catch (error: any) {
        console.error('[DigiLocker] Import error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Import all available documents from DigiLocker
 */
router.post("/digilocker/import-all", async (req, res) => {
    try {
        const userId = parseInt(req.body.userId) || 1;

        if (!digilockerService.isConnected(userId)) {
            return res.status(401).json({ error: 'Not connected to DigiLocker' });
        }

        const documents = await digilockerService.listDocuments(userId);
        const imported: string[] = [];
        const failed: string[] = [];

        // ⚡ Bolt Optimization: Parallelized independent document pull and store operations
        // Impact: Reduces batch import time from O(n) to O(1) network latency overhead
        // Performance improvement: Using Promise.all with deterministic result mapping ensures fast, stable execution
        const importResults = await Promise.all(
            documents.map(async (doc) => {
                try {
                    const { document } = await digilockerService.pullDocument(userId, doc.uri);

                    await walletService.storeCredential(userId, {
                        type: ['VerifiableCredential', doc.doctype, 'DigiLockerDocument'],
                        issuer: doc.issuer,
                        issuanceDate: new Date(doc.date),
                        data: {
                            name: doc.name,
                            description: doc.description,
                            source: 'DigiLocker',
                            uri: doc.uri,
                            issuerid: doc.issuerid,
                            ...document,
                        },
                        category: doc.doctype.includes('CLASS') ? 'academic' : 'government',
                    });

                    return { success: true, name: doc.name };
                } catch (e) {
                    return { success: false, name: doc.name };
                }
            })
        );

        for (const result of importResults) {
            if (result.success) {
                imported.push(result.name);
            } else {
                failed.push(result.name);
            }
        }

        await storage.createActivity({
            userId,
            type: "bulk_import",
            description: `Imported ${imported.length} documents from DigiLocker`,
        });

        res.json({
            success: true,
            imported,
            failed,
            total: documents.length,
        });
    } catch (error: any) {
        console.error('[DigiLocker] Import all error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Disconnect from DigiLocker
 */
router.post("/digilocker/disconnect", async (req, res) => {
    try {
        const userId = parseInt(req.body.userId) || 1;

        digilockerService.disconnect(userId);

        await storage.createActivity({
            userId,
            type: "disconnect",
            description: "Disconnected DigiLocker account",
        });

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Demo mode: Quick connect without OAuth (for testing)
 */
router.post("/digilocker/connect", async (req, res) => {
    try {
        const userId = parseInt(req.body.userId) || 1;

        // Simulate OAuth flow for demo
        const { url, state } = digilockerService.getAuthorizationUrl(userId);

        // In demo mode, auto-complete the flow
        if (digilockerService.isDemoMode()) {
            if (!allowDemoRoutes) {
                return res.status(404).json({ error: 'Not found' });
            }

            await digilockerService.exchangeCodeForTokens('demo_code', state);

            // Import demo documents
            const documents = await digilockerService.listDocuments(userId);

            // ⚡ Bolt Optimization: Parallelized independent document pull and store operations
            // Impact: Reduces import time from O(n) to O(1) network latency overhead
            // Performance improvement: Processing documents concurrently with Promise.all
            await Promise.all(
                documents.slice(0, 3).map(async (doc) => { // Import first 3
                    const { document } = await digilockerService.pullDocument(userId, doc.uri);

                    await walletService.storeCredential(userId, {
                        type: ['VerifiableCredential', doc.doctype, 'DigiLockerDocument'],
                        issuer: doc.issuer,
                        issuanceDate: new Date(doc.date),
                        data: {
                            name: doc.name,
                            source: 'DigiLocker',
                            uri: doc.uri,
                            ...document,
                        },
                        category: doc.doctype.includes('CLASS') ? 'academic' : 'government',
                    });
                    return true;
                })
            );

            await storage.createActivity({
                userId,
                type: "connect",
                description: "Connected DigiLocker account",
            });

            res.json({
                success: true,
                isDemoMode: true,
                documentsImported: 3,
                message: "DigiLocker connected (Demo Mode)",
            });
        } else {
            // Return auth URL for real mode
            res.json({
                success: false,
                requiresAuth: true,
                authUrl: url,
                state,
            });
        }
    } catch (error: any) {
        console.error('[DigiLocker] Connect error:', error);
        if (String(error?.message || '').includes('not configured')) {
            return res.status(503).json({ error: 'DigiLocker is not configured for this environment' });
        }
        res.status(500).json({ error: error.message });
    }
});

export default router;
