/**
 * @credverse/shared-auth
 * Shared authentication utilities for CredVerse applications
 */

// Types
export type {
    AuthUser,
    TokenPayload,
    TokenPair,
    VerifyTokenResult,
    AuthConfig
} from './types';

// Password utilities
export {
    hashPassword,
    comparePassword,
    validatePasswordStrength,
    type PasswordValidationResult
} from './password';

// JWT utilities
export {
    initAuth,
    generateAccessToken,
    generateRefreshToken,
    generateTokenPair,
    verifyAccessToken,
    verifyRefreshToken,
    verifyToken,
    invalidateAccessToken,
    invalidateRefreshToken,
    refreshAccessToken,
    getAuthConfig,
} from './jwt';

// Express middleware
export {
    authMiddleware,
    optionalAuthMiddleware,
    requireRole,
    checkRateLimit,
} from './middleware';

// Security middleware
export {
    setupSecurity,
    apiRateLimiter,
    authRateLimiter,
    sanitizeInput,
    deepSanitize,
    sanitizationMiddleware,
    suspiciousRequestDetector,
} from './security';
