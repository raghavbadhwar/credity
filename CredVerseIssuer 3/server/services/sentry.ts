import * as Sentry from '@sentry/node';

/**
 * Sentry Error Monitoring Configuration for CredVerse
 * Provides error tracking, performance monitoring, and crash reporting
 */

const SENTRY_DSN = process.env.SENTRY_DSN;
const APP_NAME = process.env.APP_NAME || 'credverse-issuer';

/**
 * Initialize Sentry error monitoring
 * Should be called at the very beginning of the application
 */
export function initSentry(appName?: string): void {
    if (!SENTRY_DSN) {
        console.log('[Sentry] DSN not configured, error monitoring disabled');
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        release: process.env.APP_VERSION || '1.0.0',
        serverName: appName || APP_NAME,

        // Performance Monitoring
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

        // Error filtering
        beforeSend(event, hint) {
            // Don't send in development unless explicitly enabled
            if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEV_ENABLED) {
                return null;
            }

            // Filter out non-critical errors
            const error = hint?.originalException;
            if (error instanceof Error) {
                // Don't send 404 errors, auth failures, or validation errors
                if (error.message.includes('not found') ||
                    error.message.includes('Invalid credentials') ||
                    error.message.includes('validation')) {
                    return null;
                }
            }

            return event;
        },

        // Integrations
        integrations: [
            Sentry.httpIntegration(),
            Sentry.expressIntegration(),
        ],
    });

    console.log(`[Sentry] Error monitoring initialized for ${appName || APP_NAME}`);
}

/**
 * Capture an exception manually
 */
export function captureException(error: Error, context?: Record<string, any>): void {
    if (!SENTRY_DSN) return;

    Sentry.withScope((scope) => {
        if (context) {
            scope.setExtras(context);
        }
        Sentry.captureException(error);
    });
}

/**
 * Capture a message manually
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (!SENTRY_DSN) return;

    Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; username?: string; email?: string }): void {
    if (!SENTRY_DSN) return;

    Sentry.setUser(user);
}

/**
 * Clear user context (on logout)
 */
export function clearUser(): void {
    if (!SENTRY_DSN) return;

    Sentry.setUser(null);
}

/**
 * Add breadcrumb for error context
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>): void {
    if (!SENTRY_DSN) return;

    Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
    });
}

/**
 * Sentry error handler middleware for Express
 */
export const sentryErrorHandler = Sentry.expressErrorHandler();

/**
 * Sentry request handler middleware for Express
 */
export const sentryRequestHandler = Sentry.expressIntegration;

// Re-export Sentry for advanced usage
export { Sentry };
