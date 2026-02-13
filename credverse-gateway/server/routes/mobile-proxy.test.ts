import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import mobileProxyRoutes from './mobile-proxy';

const originalFetch = globalThis.fetch;

type MockFetchCall = {
    input: string;
    init?: RequestInit;
};

async function withProxyServer<T>(
    handler: (ctx: {
        baseUrl: string;
        localFetch: typeof fetch;
        calls: MockFetchCall[];
    }) => Promise<T>,
): Promise<T> {
    const calls: MockFetchCall[] = [];
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
        calls.push({ input: String(input), init });
        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });
    }) as typeof fetch;

    const app = express();
    app.use(express.json());
    app.use('/api/mobile', mobileProxyRoutes);

    const server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', resolve));

    const address = server.address();
    if (!address || typeof address === 'string') {
        throw new Error('Failed to bind proxy test server');
    }

    const baseUrl = `http://127.0.0.1:${address.port}`;
    const localFetch = originalFetch;

    try {
        return await handler({ baseUrl, localFetch, calls });
    } finally {
        await new Promise<void>((resolve, reject) => {
            server.close((error) => (error ? reject(error) : resolve()));
        });
        globalThis.fetch = originalFetch;
    }
}

test('mobile proxy blocks unknown targets and disallowed routes', async () => {
    await withProxyServer(async ({ baseUrl, localFetch, calls }) => {
        const unknownTarget = await localFetch(`${baseUrl}/api/mobile/unknown/auth/me`);
        assert.equal(unknownTarget.status, 404);

        const blockedPath = await localFetch(`${baseUrl}/api/mobile/wallet/not-allowed/path`);
        assert.equal(blockedPath.status, 403);

        const traversalPath = await localFetch(`${baseUrl}/api/mobile/wallet/%2e%2e/auth/login`);
        assert.ok([403, 404].includes(traversalPath.status));

        assert.equal(calls.length, 0);
    });
});

test('mobile proxy forwards issuer well-known metadata without /api prefix', async () => {
    await withProxyServer(async ({ baseUrl, localFetch, calls }) => {
        const response = await localFetch(`${baseUrl}/api/mobile/issuer/.well-known/openid-credential-issuer`);
        assert.equal(response.status, 200);
        assert.equal(calls.length, 1);
        assert.equal(calls[0]?.input, 'http://localhost:5001/.well-known/openid-credential-issuer');
    });
});

test('mobile proxy forwards issuer OID routes with /api prefix and propagates idempotency key', async () => {
    await withProxyServer(async ({ baseUrl, localFetch, calls }) => {
        const response = await localFetch(`${baseUrl}/api/mobile/issuer/v1/oid4vci/credential`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Idempotency-Key': 'test-idempotency-key',
            },
            body: JSON.stringify({ sample: true }),
        });

        assert.equal(response.status, 200);
        assert.equal(calls.length, 1);
        assert.equal(calls[0]?.input, 'http://localhost:5001/api/v1/oid4vci/credential');

        const upstreamHeaders = calls[0]?.init?.headers as Headers | undefined;
        assert.ok(upstreamHeaders);
        assert.equal(upstreamHeaders?.get('idempotency-key'), 'test-idempotency-key');
    });
});

test('mobile proxy forwards wallet reputation v1 routes with /api prefix', async () => {
    await withProxyServer(async ({ baseUrl, localFetch, calls }) => {
        const response = await localFetch(`${baseUrl}/api/mobile/wallet/v1/reputation/score?userId=1`);
        assert.equal(response.status, 200);
        assert.equal(calls.length, 1);
        assert.equal(calls[0]?.input, 'http://localhost:5002/api/v1/reputation/score?userId=1');
    });
});

test('mobile proxy forwards wallet compliance routes with /api prefix', async () => {
    await withProxyServer(async ({ baseUrl, localFetch, calls }) => {
        const response = await localFetch(`${baseUrl}/api/mobile/wallet/v1/compliance/consents?userId=7`);
        assert.equal(response.status, 200);
        assert.equal(calls.length, 1);
        assert.equal(calls[0]?.input, 'http://localhost:5002/api/v1/compliance/consents?userId=7');
    });
});

test('mobile proxy forwards issuer queue and compliance routes with /api prefix', async () => {
    await withProxyServer(async ({ baseUrl, localFetch, calls }) => {
        const queueResponse = await localFetch(`${baseUrl}/api/mobile/issuer/v1/queue/dead-letter?limit=5`);
        assert.equal(queueResponse.status, 200);
        assert.equal(calls[0]?.input, 'http://localhost:5001/api/v1/queue/dead-letter?limit=5');

        const complianceResponse = await localFetch(`${baseUrl}/api/mobile/issuer/v1/compliance/consents`);
        assert.equal(complianceResponse.status, 200);
        assert.equal(calls[1]?.input, 'http://localhost:5001/api/v1/compliance/consents');
    });
});

test('mobile proxy forwards recruiter compliance routes with /api prefix', async () => {
    await withProxyServer(async ({ baseUrl, localFetch, calls }) => {
        const response = await localFetch(`${baseUrl}/api/mobile/recruiter/v1/compliance/audit-log/export`);
        assert.equal(response.status, 200);
        assert.equal(calls.length, 1);
        assert.equal(calls[0]?.input, 'http://localhost:5003/api/v1/compliance/audit-log/export');
    });
});
