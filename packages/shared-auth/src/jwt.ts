/**
 * JWT token generation and verification utilities
 */
import jwt from 'jsonwebtoken';
import type { AuthUser, TokenPayload, TokenPair, AuthConfig, VerifyTokenResult } from './types';

const DEFAULT_ACCESS_EXPIRY = '15m';
const DEFAULT_REFRESH_EXPIRY = '7d';
const JWT_ALGORITHM = 'HS256' as const;

// In-memory token storage (use Redis in production)
const refreshTokens = new Map<string, { userId: string | number; expiresAt: Date }>();
const invalidatedTokens = new Set<string>();

let config: AuthConfig = {
    jwtSecret: 'dev-only-secret-not-for-production',
    jwtRefreshSecret: 'dev-only-refresh-secret-not-for-production',
    accessTokenExpiry: DEFAULT_ACCESS_EXPIRY,
    refreshTokenExpiry: DEFAULT_REFRESH_EXPIRY,
    app: 'unknown',
};

/**
 * Initialize auth configuration
 */
export function initAuth(authConfig: Partial<AuthConfig>): void {
    config = {
        ...config,
        ...authConfig,
    };

    if (!authConfig.jwtSecret) {
        console.warn('WARNING: Using development JWT secrets. Set JWT_SECRET for production.');
    }
}

/**
 * Generate access token
 */
export function generateAccessToken(user: AuthUser): string {
    const payload: TokenPayload = {
        userId: user.id,
        username: user.username,
        role: user.role,
        type: 'access',
        app: config.app,
    };
    return jwt.sign(payload, config.jwtSecret, {
        expiresIn: config.accessTokenExpiry || DEFAULT_ACCESS_EXPIRY,
        algorithm: JWT_ALGORITHM
    } as jwt.SignOptions);
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(user: AuthUser): string {
    const payload: TokenPayload = {
        userId: user.id,
        username: user.username,
        role: user.role,
        type: 'refresh',
        app: config.app,
    };
    const token = jwt.sign(payload, config.jwtRefreshSecret, {
        expiresIn: config.refreshTokenExpiry || DEFAULT_REFRESH_EXPIRY,
        algorithm: JWT_ALGORITHM
    } as jwt.SignOptions);

    // Store refresh token
    refreshTokens.set(token, {
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return token;
}

/**
 * Generate both tokens
 */
export function generateTokenPair(user: AuthUser): TokenPair {
    return {
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user),
        expiresIn: 900, // 15 minutes in seconds
    };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
    try {
        if (invalidatedTokens.has(token)) {
            return null;
        }
        const decoded = jwt.verify(token, config.jwtSecret, { algorithms: [JWT_ALGORITHM] }) as TokenPayload;
        if (decoded.type !== 'access') {
            return null;
        }
        return decoded;
    } catch {
        return null;
    }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
    try {
        if (!refreshTokens.has(token)) {
            return null;
        }
        const decoded = jwt.verify(token, config.jwtRefreshSecret, { algorithms: [JWT_ALGORITHM] }) as TokenPayload;
        if (decoded.type !== 'refresh') {
            return null;
        }
        return decoded;
    } catch {
        return null;
    }
}

/**
 * Verify token and return structured result (for cross-app validation)
 */
export function verifyToken(token: string): VerifyTokenResult {
    const payload = verifyAccessToken(token);

    if (!payload) {
        return { valid: false, error: 'Invalid or expired token' };
    }

    return {
        valid: true,
        user: {
            userId: payload.userId,
            username: payload.username,
            role: payload.role,
        },
        app: config.app,
    };
}

/**
 * Invalidate refresh token (logout)
 */
export function invalidateRefreshToken(token: string): void {
    refreshTokens.delete(token);
}

/**
 * Invalidate access token
 */
export function invalidateAccessToken(token: string): void {
    invalidatedTokens.add(token);
    // Clean up old tokens periodically
    if (invalidatedTokens.size > 10000) {
        invalidatedTokens.clear();
    }
}

/**
 * Refresh access token using refresh token
 */
export function refreshAccessToken(refreshToken: string): TokenPair | null {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
        return null;
    }

    // Invalidate old refresh token (rotation)
    invalidateRefreshToken(refreshToken);

    const user: AuthUser = {
        id: payload.userId,
        username: payload.username,
        role: payload.role as AuthUser['role'],
    };

    return generateTokenPair(user);
}

/**
 * Get current auth configuration
 */
export function getAuthConfig(): Readonly<AuthConfig> {
    return { ...config };
}
