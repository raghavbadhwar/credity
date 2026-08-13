import { Router } from 'express';
import crypto from 'crypto';
import { apiKeyOrAuthMiddleware } from '../auth';
import { issuanceService } from '../services/issuance';
import { storage } from '../storage';
import { idempotencyMiddleware, PostgresStateStore } from '@credverse/shared-auth';
import {
    registerCredentialStatus,
    revokeCredentialStatus,
    getCredentialStatus,
    getStatusList,
} from '../services/status-list-service';
import {
    createAnchorBatch,
    anchorBatch,
    getAnchorBatch,
    getAnchorDeadLetters,
    getAnchorProof,
    replayAnchorBatch,
} from '../services/anchor-batch-service';

type CredentialOfferState = {
    tenantId: string;
    templateId: string;
    issuerId: string;
    recipient: Record<string, unknown>;
    credentialData: Record<string, unknown>;
    format: 'sd-jwt-vc' | 'vc+jwt';
    expiresAt: number;
};

type AccessTokenState = { offer: CredentialOfferState; expiresAt: number };
type Oid4vciRuntimeState = {
    preAuthCodes: Array<[string, CredentialOfferState]>;
    accessTokens: Array<[string, AccessTokenState]>;
};

const preAuthCodes = new Map<string, CredentialOfferState>();
const accessTokens = new Map<string, AccessTokenState>();
const hasDatabase = typeof process.env.DATABASE_URL === 'string' && process.env.DATABASE_URL.length > 0;
const stateStore = hasDatabase
    ? new PostgresStateStore<Oid4vciRuntimeState>({
        databaseUrl: process.env.DATABASE_URL as string,
        serviceKey: 'issuer-oid4vci-runtime',
    })
    : null;

let hydrated = false;
let hydrationPromise: Promise<void> | null = null;
let persistChain = Promise.resolve();

const router = Router();
const writeIdempotency = idempotencyMiddleware({ ttlMs: 6 * 60 * 60 * 1000 });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildBaseUrl(req: any): string {
    return `${req.protocol}://${req.get('host')}`;
}

function issueRandomId(prefix: string): string {
    return `${prefix}_${crypto.randomBytes(16).toString('hex')}`;
}

function parseBearer(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    return authHeader.slice(7);
}

async function ensureHydrated(): Promise<void> {
    if (!stateStore || hydrated) return;
    if (!hydrationPromise) {
        hydrationPromise = (async () => {
            const loaded = await stateStore.load();
            if (loaded) {
                preAuthCodes.clear();
                accessTokens.clear();
                for (const [code, offer] of loaded.preAuthCodes || []) {
                    preAuthCodes.set(code, offer);
                }
                for (const [token, tokenState] of loaded.accessTokens || []) {
                    accessTokens.set(token, tokenState);
                }
            } else {
                await stateStore.save({
                    preAuthCodes: [],
                    accessTokens: [],
                });
            }
            hydrated = true;
        })();
    }
    await hydrationPromise;
}

async function queuePersist(): Promise<void> {
    if (!stateStore) return;
    persistChain = persistChain
        .then(async () => {
            await stateStore.save({
                preAuthCodes: Array.from(preAuthCodes.entries()),
                accessTokens: Array.from(accessTokens.entries()),
            });
        })
        .catch((error) => {
            console.error('[OID4VCI] Persist failed:', error);
        });
    await persistChain;
}

function pruneExpiredOidSessionState(): boolean {
    let changed = false;
    const now = Date.now();
    for (const [code, offer] of preAuthCodes.entries()) {
        if (offer.expiresAt < now) {
            preAuthCodes.delete(code);
            changed = true;
        }
    }
    for (const [token, state] of accessTokens.entries()) {
        if (state.expiresAt < now) {
            accessTokens.delete(token);
            changed = true;
        }
    }
    return changed;
}

router.get('/.well-known/openid-credential-issuer', (req, res) => {
    const baseUrl = buildBaseUrl(req);
    res.json({
        credential_issuer: `${baseUrl}/api/v1/oid4vci`,
        authorization_servers: [`${baseUrl}/api/v1/oid4vci`],
        credential_endpoint: `${baseUrl}/api/v1/oid4vci/credential`,
        token_endpoint: `${baseUrl}/api/v1/oid4vci/token`,
        deferred_credential_endpoint: `${baseUrl}/api/v1/oid4vci/deferred`,
        credential_configurations_supported: {
            'credity_identity_v1': {
                format: 'vc+jwt',
                cryptographic_binding_methods_supported: ['did:key', 'did:web'],
                proof_types_supported: { jwt: { proof_signing_alg_values_supported: ['ES256', 'EdDSA'] } },
            },
            'credity_identity_sdjwt_v1': {
                format: 'sd-jwt-vc',
                cryptographic_binding_methods_supported: ['did:key', 'did:web'],
                proof_types_supported: { jwt: { proof_signing_alg_values_supported: ['ES256', 'EdDSA'] } },
            },
        },
    });
});

router.post('/api/v1/oid4vci/credential-offers', apiKeyOrAuthMiddleware, writeIdempotency, async (req, res) => {
    try {
        await ensureHydrated();
        const pruned = pruneExpiredOidSessionState();
        if (pruned) {
            await queuePersist();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tenantId = (req as any).tenantId;
        const { templateId, issuerId, recipient, credentialData, format = 'sd-jwt-vc' } = req.body || {};
        if (!templateId || !issuerId || !recipient || !credentialData) {
            return res.status(400).json({ error: 'templateId, issuerId, recipient and credentialData are required' });
        }

        const preAuthorizedCode = issueRandomId('preauth');
        preAuthCodes.set(preAuthorizedCode, {
            tenantId,
            templateId,
            issuerId,
            recipient,
            credentialData,
            format: format === 'vc+jwt' ? 'vc+jwt' : 'sd-jwt-vc',
            expiresAt: Date.now() + 10 * 60 * 1000,
        });
        await queuePersist();

        const baseUrl = buildBaseUrl(req);
        res.status(201).json({
            credential_offer: {
                credential_issuer: `${baseUrl}/api/v1/oid4vci`,
                credential_configuration_ids: ['credity_identity_v1'],
                grants: {
                    'urn:ietf:params:oauth:grant-type:pre-authorized_code': {
                        'pre-authorized_code': preAuthorizedCode,
                        user_pin_required: false,
                    },
                },
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expires_in: 600,
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Failed to create credential offer' });
    }
});

router.post('/api/v1/oid4vci/token', async (req, res) => {
    try {
        await ensureHydrated();
        const pruned = pruneExpiredOidSessionState();
        if (pruned) {
            await queuePersist();
        }

        const { grant_type: grantType, 'pre-authorized_code': preAuthorizedCode } = req.body || {};
        if (grantType !== 'urn:ietf:params:oauth:grant-type:pre-authorized_code') {
            return res.status(400).json({ error: 'unsupported_grant_type' });
        }
        if (!preAuthorizedCode) {
            return res.status(400).json({ error: 'pre-authorized_code is required' });
        }

        const offer = preAuthCodes.get(preAuthorizedCode);
        if (!offer || offer.expiresAt < Date.now()) {
            return res.status(401).json({ error: 'invalid_grant' });
        }
        preAuthCodes.delete(preAuthorizedCode);

        const accessToken = issueRandomId('at');
        accessTokens.set(accessToken, { offer, expiresAt: Date.now() + 10 * 60 * 1000 });
        await queuePersist();

        res.json({
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: 600,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            c_nonce: issueRandomId('nonce'),
            c_nonce_expires_in: 600,
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ error: error?.message || 'token_endpoint_failure' });
    }
});

router.post('/api/v1/oid4vci/credential', writeIdempotency, async (req, res) => {
    try {
        await ensureHydrated();
        const pruned = pruneExpiredOidSessionState();
        if (pruned) {
            await queuePersist();
        }
        const token = parseBearer(req.header('Authorization'));
        if (!token) {
            return res.status(401).json({ error: 'invalid_token' });
        }
        const tokenState = accessTokens.get(token);
        if (!tokenState || tokenState.expiresAt < Date.now()) {
            return res.status(401).json({ error: 'invalid_token' });
        }
        const offer = tokenState.offer;
        if (!offer || offer.expiresAt < Date.now()) {
            return res.status(401).json({ error: 'invalid_grant' });
        }
        accessTokens.delete(token);
        await queuePersist();

        const credential = await issuanceService.issueCredential(
            offer.tenantId,
            offer.templateId,
            offer.issuerId,
            offer.recipient,
            offer.credentialData
        );

        const status = await registerCredentialStatus(credential.id);
        res.json({
            format: offer.format,
            credential: credential.vcJwt,
            c_nonce: issueRandomId('nonce'),
            c_nonce_expires_in: 600,
            credential_id: credential.id,
            status: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                status_list_id: status.listId,
                status_list_index: status.index,
            },
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Credential issuance failed' });
    }
});

router.post('/api/v1/oid4vci/deferred', async (req, res) => {
    const { acceptance_token: acceptanceToken } = req.body || {};
    res.status(202).json({
        acceptance_token: acceptanceToken || null,
        status: 'pending',
        retry_after: 5,
    });
});

router.get('/api/v1/status/bitstring/:listId', async (req, res) => {
    try {
        const list = await getStatusList(req.params.listId);
        res.json({
            id: list.id,
            type: 'BitstringStatusList',
            bitstring: list.bitstring,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            size: list.size,
            revoked_count: list.revokedCount,
            digest: list.digest,
            updated_at: list.updatedAt,
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ message: error?.message || 'Failed to resolve status list' });
    }
});

router.post('/api/v1/credentials/:id/revoke', apiKeyOrAuthMiddleware, writeIdempotency, async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try {
        const credentialId = req.params.id;
        const credential = await storage.getCredential(credentialId);
        if (!credential) {
            return res.status(404).json({ message: 'Credential not found' });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tenantId = (req as any).tenantId;
        if (credential.tenantId !== tenantId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const reason = req.body?.reason || 'revoked_by_issuer';
        await issuanceService.revokeCredential(credentialId, reason);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = await revokeCredentialStatus(credentialId);

        res.json({
            success: true,
            credential_id: credentialId,
            status: status ? { list_id: status.listId, index: status.index, revoked: status.revoked } : null,
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Failed to revoke credential' });
    }
});

router.post('/api/v1/anchors/batches', apiKeyOrAuthMiddleware, writeIdempotency, async (req, res) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { credentialIds } = req.body || {};
        if (!Array.isArray(credentialIds) || credentialIds.length === 0) {
            return res.status(400).json({ message: 'credentialIds is required' });
        }

// eslint-disable-next-line @typescript-eslint/no-explicit-any

        const records = await Promise.all(
            credentialIds.map((id: string) => storage.getCredential(id))
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const validRecords = records.filter(Boolean) as any[];
        if (validRecords.length !== credentialIds.length) {
            return res.status(400).json({ message: 'One or more credentials do not exist' });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tenantId = (req as any).tenantId;
        const hasForeignTenantRecord = validRecords.some((record) => record.tenantId !== tenantId);
        if (hasForeignTenantRecord) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const hashInputs = validRecords.map((record) => {
            const knownHash = record.credentialHash || record.txHash;
            if (knownHash) return String(knownHash);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return crypto.createHash('sha256').update(record.vcJwt || JSON.stringify(record.credentialData)).digest('hex');
        });

        const batch = await createAnchorBatch(credentialIds, hashInputs);
        void anchorBatch(batch.batchId);
        res.status(202).json({
            batch_id: batch.batchId,
            status: batch.status,
            merkle_root: batch.merkleRoot,
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        res.status(500).json({ message: error.message || 'Failed to create anchor batch' });
    }
});

router.get('/api/v1/anchors/batches/:batchId', async (req, res) => {
    try {
        const batch = await getAnchorBatch(req.params.batchId);
        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }
        res.json(batch);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ message: error?.message || 'Failed to load anchor batch' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
});

router.post('/api/v1/anchors/batches/:batchId/replay', apiKeyOrAuthMiddleware, writeIdempotency, async (req, res) => {
    try {
        const replayed = await replayAnchorBatch(req.params.batchId);
        res.status(202).json({
            batch_id: replayed.batchId,
            status: replayed.status,
            tx_hash: replayed.txHash,
            attempt_count: replayed.attemptCount,
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        const message = error?.message || 'Failed to replay anchor batch';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = message.toLowerCase().includes('not found') ? 404 : 500;
        res.status(status).json({ message });
    }
});

router.get('/api/v1/anchors/dead-letter', apiKeyOrAuthMiddleware, async (req, res) => {
    try {
        const limit = Number(req.query.limit || 50);
        const entries = await getAnchorDeadLetters(limit);
        res.json({
            count: entries.length,
            entries,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ message: error?.message || 'Failed to load dead-letter entries' });
    }
});

router.get('/api/v1/anchors/proofs/:credentialId', async (req, res) => {
    try {
        const proof = await getAnchorProof(req.params.credentialId);
        if (!proof) {
            return res.status(404).json({ message: 'Proof not found' });
        }
        res.json(proof);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ message: error?.message || 'Failed to load anchor proof' });
    }
});

router.get('/api/v1/credentials/:id/status', async (req, res) => {
    const credential = await storage.getCredential(req.params.id);
    if (!credential) {
        return res.status(404).json({ message: 'Credential not found' });
    }
    const status = await getCredentialStatus(req.params.id);
    res.json({
        credential_id: req.params.id,
        revoked: credential.revoked,
        status_list: status,
    });
});

export default router;
