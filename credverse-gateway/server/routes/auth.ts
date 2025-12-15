/**
 * Authentication routes for CredVerse Gateway
 * Includes JWT SSO for cross-app authentication
 */
import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {
    getAuthorizationUrl,
    exchangeCodeForTokens,
    getGoogleUserInfo,
    isGoogleOAuthConfigured,
    type GoogleUser,
} from '../services/google';

const router = Router();

// JWT Configuration - same secret as other apps for cross-app SSO
const JWT_SECRET = process.env.JWT_SECRET || 'credverse-dev-jwt-secret-2024';
const JWT_EXPIRES_IN = '7d';

// In-memory session storage (use Redis in production)
const sessions = new Map<string, { user: GoogleUser; jwtToken: string; createdAt: Date }>();
const pendingStates = new Map<string, { createdAt: Date }>();

/**
 * Generate JWT for cross-app SSO
 */
function generateSSOToken(user: GoogleUser): string {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            name: user.name,
            picture: user.picture,
            role: 'user',
            app: 'gateway',
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

/**
 * Verify SSO token
 */
function verifySSOToken(token: string): any {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

/**
 * Check if Google OAuth is available
 */
router.get('/auth/status', (req, res) => {
    res.json({
        googleOAuth: isGoogleOAuthConfigured(),
        sso: true,
        message: isGoogleOAuthConfigured()
            ? 'Google OAuth is configured with SSO'
            : 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET',
    });
});

/**
 * Start Google OAuth flow
 */
router.get('/auth/google', (req, res) => {
    if (!isGoogleOAuthConfigured()) {
        return res.status(503).json({ error: 'Google OAuth not configured' });
    }

    const state = crypto.randomBytes(32).toString('hex');
    pendingStates.set(state, { createdAt: new Date() });

    // Clean up old states
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    for (const [key, value] of pendingStates.entries()) {
        if (value.createdAt.getTime() < tenMinutesAgo) {
            pendingStates.delete(key);
        }
    }

    const authUrl = getAuthorizationUrl(state);
    res.redirect(authUrl);
});

/**
 * Handle Google OAuth callback
 */
router.get('/auth/google/callback', async (req, res) => {
    try {
        const { code, state, error } = req.query;

        if (error) {
            return res.redirect(`/?error=${encodeURIComponent(error as string)}`);
        }

        if (!code || !state) {
            return res.redirect('/?error=invalid_request');
        }

        if (!pendingStates.has(state as string)) {
            return res.redirect('/?error=invalid_state');
        }
        pendingStates.delete(state as string);

        const tokens = await exchangeCodeForTokens(code as string);
        const googleUser = await getGoogleUserInfo(tokens.accessToken);
        const jwtToken = generateSSOToken(googleUser);

        const sessionId = crypto.randomBytes(32).toString('hex');
        sessions.set(sessionId, { user: googleUser, jwtToken, createdAt: new Date() });

        res.cookie('session', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.cookie('sso_token', jwtToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.redirect(`/?login=success&name=${encodeURIComponent(googleUser.name)}`);
    } catch (error) {
        console.error('[Auth] Google callback error:', error);
        res.redirect('/?error=auth_failed');
    }
});

/**
 * Get current user and SSO token
 */
router.get('/auth/me', (req, res) => {
    const sessionId = req.cookies?.session;

    if (!sessionId || !sessions.has(sessionId)) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const session = sessions.get(sessionId)!;
    res.json({
        user: session.user,
        ssoToken: session.jwtToken,
        authenticated: true,
    });
});

/**
 * Verify SSO token - used by other apps for cross-app auth
 */
router.post('/auth/verify-token', (req, res) => {
    let token = req.body?.token;

    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.slice(7);
        }
    }

    if (!token) {
        return res.json({ valid: false, error: 'No token provided' });
    }

    const decoded = verifySSOToken(token);
    if (decoded) {
        res.json({
            valid: true,
            user: {
                id: decoded.sub,
                email: decoded.email,
                name: decoded.name,
                picture: decoded.picture,
            },
            app: 'gateway',
        });
    } else {
        res.json({ valid: false, error: 'Invalid or expired token' });
    }
});

/**
 * Logout
 */
router.post('/auth/logout', (req, res) => {
    const sessionId = req.cookies?.session;
    if (sessionId) sessions.delete(sessionId);
    res.clearCookie('session');
    res.clearCookie('sso_token');
    res.json({ success: true });
});

/**
 * Demo login
 */
router.post('/auth/demo-login', (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email required' });
    }

    const demoUser: GoogleUser = {
        id: `demo-${Date.now()}`,
        email,
        name,
        picture: undefined,
    };

    const jwtToken = generateSSOToken(demoUser);
    const sessionId = crypto.randomBytes(32).toString('hex');
    sessions.set(sessionId, { user: demoUser, jwtToken, createdAt: new Date() });

    res.cookie('session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('sso_token', jwtToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
        success: true,
        user: demoUser,
        ssoToken: jwtToken,
    });
});

export default router;
