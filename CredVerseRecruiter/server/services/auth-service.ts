import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// Enforce environment variables for production security
if (!process.env.JWT_SECRET) {
    console.error('CRITICAL SECURITY WARNING: JWT_SECRET environment variable is not set!');
    console.error('Using a random secret for this session - tokens will not persist across restarts');
}
if (!process.env.JWT_REFRESH_SECRET) {
    console.error('CRITICAL SECURITY WARNING: JWT_REFRESH_SECRET environment variable is not set!');
    console.error('Using a random secret for this session - tokens will not persist across restarts');
}

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || crypto.randomBytes(64).toString('hex');
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// In-memory token storage (use Redis in production)
const refreshTokens = new Map<string, { userId: string; expiresAt: Date }>();
const invalidatedTokens = new Set<string>();

export interface AuthUser {
    id: string;
    username: string;
    email?: string;
    role: 'admin' | 'issuer' | 'holder' | 'verifier' | 'recruiter';
}

export interface TokenPayload {
    userId: string;
    username: string;
    role: string;
    type: 'access' | 'refresh';
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (password.length > 128) {
        errors.push('Password must not exceed 128 characters');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
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
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
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
    };
    const token = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

    // Store refresh token
    refreshTokens.set(token, {
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return token;
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
    try {
        if (invalidatedTokens.has(token)) {
            return null;
        }
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
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
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
        if (decoded.type !== 'refresh') {
            return null;
        }
        return decoded;
    } catch {
        return null;
    }
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
export function refreshAccessToken(refreshToken: string): { accessToken: string; refreshToken: string } | null {
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

    return {
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user),
    };
}

/**
 * Generate a secure API key
 */
export function generateApiKey(): string {
    return `cv_${crypto.randomBytes(32).toString('hex')}`;
}

/**
 * Hash API key for storage
 */
export function hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
}

// Express middleware types
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

/**
 * JWT Authentication Middleware
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    if (!payload) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
    }

    req.user = payload;
    next();
}

/**
 * Optional auth middleware - doesn't fail if no token
 */
export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = verifyAccessToken(token);
        if (payload) {
            req.user = payload;
        }
    }

    next();
}

/**
 * Role-based access control middleware
 */
export function requireRole(...roles: AuthUser['role'][]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const userRole = req.user.role as AuthUser['role'];
        if (roles.includes("admin") && userRole === "admin") {
            next();
            return;
        }

        if (!roles.includes(userRole)) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }

        next();
    };
}

/**
 * Rate limiting helper
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetAt) {
        rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }

    if (record.count >= maxRequests) {
        return false;
    }

    record.count++;
    return true;
}
