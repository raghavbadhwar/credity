import { Router, type Request } from 'express';

type ProxyTarget = 'wallet' | 'issuer' | 'recruiter';

interface TargetConfig {
    envKey: string;
    fallbackUrl: string;
    allowedPrefixes: string[];
    nonApiPrefixes?: string[];
}

const TARGETS: Record<ProxyTarget, TargetConfig> = {
    wallet: {
        envKey: 'WALLET_API_URL',
        fallbackUrl: 'http://localhost:5002',
        allowedPrefixes: [
            'v1/auth',
            'v1/wallet',
            'v1/credentials',
            'v1/did',
            'v1/digilocker',
            'v1/identity',
            'v1/trust-score',
            'v1/reputation',
            'v1/connections',
            'v1/compliance',
            'auth',
            'wallet',
            'credentials',
            'did',
            'digilocker',
            'identity',
            'trust-score',
            'reputation',
            'connections',
            'v1/claims',
            'compliance',
        ],
    },
    issuer: {
        envKey: 'ISSUER_API_URL',
        fallbackUrl: 'http://localhost:5001',
        allowedPrefixes: [
            'v1/oid4vci',
            'v1/compliance',
            'v1/queue',
            'v1/status/bitstring',
            'v1/anchors',
            'v1/auth',
            'v1/credentials',
            'v1/students',
            'v1/templates',
            'v1/verify',
            'v1/analytics',
            'v1/verification-logs',
            'v1/reports',
            'v1/exports',
            'v1/reputation',
        ],
        nonApiPrefixes: [
            '.well-known/openid-credential-issuer',
        ],
    },
    recruiter: {
        envKey: 'RECRUITER_API_URL',
        fallbackUrl: 'http://localhost:5003',
        allowedPrefixes: [
            'auth',
            'verify',
            'verifications',
            'fraud',
            'v1/oid4vp',
            'v1/verifications',
            'v1/compliance',
        ],
    },
};

const FORWARDED_HEADERS = [
    'authorization',
    'content-type',
    'idempotency-key',
    'x-api-key',
    'x-request-id',
];

const PROXY_TIMEOUT_MS = Number(process.env.MOBILE_PROXY_TIMEOUT_MS || 10_000);

function normalizeSubpath(rawPath: string): string {
    return rawPath
        .replace(/^\/+/, '')
        .replace(/\/+/g, '/')
        .replace(/\/$/, '');
}

function isSubpathAllowed(target: ProxyTarget, subpath: string): boolean {
    if (subpath.length > 1024) return false;
    const parts = subpath.split('/');
    if (parts.some((part) => part === '..' || part === '.')) return false;

    const prefixes = TARGETS[target].allowedPrefixes;
    const isApiAllowed = prefixes.some((prefix) => subpath === prefix || subpath.startsWith(`${prefix}/`));
    if (isApiAllowed) return true;

    const nonApiPrefixes = TARGETS[target].nonApiPrefixes || [];
    return nonApiPrefixes.some((prefix) => subpath === prefix || subpath.startsWith(`${prefix}/`));
}

function resolveTargetBaseUrl(target: ProxyTarget): string {
    const cfg = TARGETS[target];
    return (process.env[cfg.envKey] || cfg.fallbackUrl).replace(/\/$/, '');
}

function buildTargetUrl(target: ProxyTarget, subpath: string, query: Record<string, unknown>): string {
    const baseUrl = resolveTargetBaseUrl(target);
    const nonApiPrefixes = TARGETS[target].nonApiPrefixes || [];
    const useApiPrefix = !nonApiPrefixes.some(
        (prefix) => subpath === prefix || subpath.startsWith(`${prefix}/`),
    );
    const url = new URL(useApiPrefix ? `${baseUrl}/api/${subpath}` : `${baseUrl}/${subpath}`);

    for (const [key, value] of Object.entries(query)) {
        if (value === undefined) continue;
        if (Array.isArray(value)) {
            for (const v of value) {
                url.searchParams.append(key, String(v));
            }
            continue;
        }
        url.searchParams.append(key, String(value));
    }

    return url.toString();
}

function getForwardHeaders(req: Request): Headers {
    const headers = new Headers();

    FORWARDED_HEADERS.forEach((header) => {
        const value = req.headers[header];
        if (!value) return;
        if (Array.isArray(value)) {
            headers.set(header, value.join(','));
            return;
        }
        headers.set(header, value);
    });

    return headers;
}

function getForwardBody(req: Request): BodyInit | undefined {
    if (req.method === 'GET' || req.method === 'HEAD') {
        return undefined;
    }

    if (req.body === undefined || req.body === null) {
        return undefined;
    }

    if (typeof req.body === 'string') {
        return req.body;
    }

    if (Buffer.isBuffer(req.body)) {
        return req.body;
    }

    return JSON.stringify(req.body);
}

const router = Router();

router.all('/:target/*', async (req, res) => {
    const rawTarget = req.params.target;
    if (!rawTarget || !Object.prototype.hasOwnProperty.call(TARGETS, rawTarget)) {
        return res.status(404).json({ error: 'Unknown mobile proxy target' });
    }

    const target = rawTarget as ProxyTarget;
    const wildcardPath = req.params[0] || '';
    const subpath = normalizeSubpath(wildcardPath);

    if (!subpath) {
        return res.status(400).json({ error: 'Missing upstream path' });
    }

    if (!isSubpathAllowed(target, subpath)) {
        return res.status(403).json({ error: 'Route not allowed by mobile proxy policy' });
    }

    const targetUrl = buildTargetUrl(target, subpath, req.query as Record<string, unknown>);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
    const startedAt = Date.now();

    try {
        const upstreamResponse = await fetch(targetUrl, {
            method: req.method,
            headers: getForwardHeaders(req),
            body: getForwardBody(req),
            signal: controller.signal,
        });

        const responseBuffer = Buffer.from(await upstreamResponse.arrayBuffer());
        const contentType = upstreamResponse.headers.get('content-type');

        if (contentType) {
            res.setHeader('content-type', contentType);
        }
        if (process.env.NODE_ENV !== 'production') {
            res.setHeader('X-Proxy-Target', target);
            res.setHeader('X-Proxy-Latency-Ms', String(Date.now() - startedAt));
        }

        return res.status(upstreamResponse.status).send(responseBuffer);
    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isAbort = (error as any)?.name === 'AbortError';
        const statusCode = isAbort ? 504 : 502;
        return res.status(statusCode).json({
            error: isAbort ? 'Upstream timeout' : 'Upstream request failed',
            target,
            path: subpath,
        });
    } finally {
        clearTimeout(timeout);
    }
});

export default router;
