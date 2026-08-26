import express from 'express';
import { beforeEach, describe, expect, it } from 'vitest';
import userRoutes from '../server/routes/user';
import { storage } from '../server/storage';

async function withServer<T>(handler: (baseUrl: string) => Promise<T>): Promise<T> {
    const app = express();
    app.use(express.json());
    // Mount the user routes, using the same pattern as production
    app.use('/api/v1', userRoutes);

    const server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', resolve));

    const address = server.address();
    if (!address || typeof address === 'string') {
        throw new Error('Failed to bind test server');
    }

    const baseUrl = `http://127.0.0.1:${address.port}`;
    try {
        return await handler(baseUrl);
    } finally {
        await new Promise<void>((resolve, reject) => {
            server.close((error) => (error ? reject(error) : resolve()));
        });
    }
}

describe('user routes security', () => {
    beforeEach(() => {
        // Clear or reset storage if needed
        // (storage as any).users?.clear?.();
    });

    it('should reject unauthenticated access to /api/v1/user', async () => {
        await withServer(async (baseUrl) => {
            // Attempt to access user profile without token
            const response = await fetch(`${baseUrl}/api/v1/user`);

            // This assertion will FAIL initially because the route currently returns 200/404 for hardcoded user 1
            // We want it to be 401
            expect(response.status).toBe(401);

            const body = await response.json() as { error?: string };
            expect(body.error).toBe('No token provided');
        });
    });

    it('should reject unauthenticated access to /api/v1/activity', async () => {
        await withServer(async (baseUrl) => {
            // Attempt to access user activity without token
            const response = await fetch(`${baseUrl}/api/v1/activity`);

            // This assertion will FAIL initially because the route currently returns 200 with activity for user 1
            // We want it to be 401
            expect(response.status).toBe(401);

            const body = await response.json() as { error?: string };
            expect(body.error).toBe('No token provided');
        });
    });

    it('should reject unauthenticated PATCH to /api/v1/user', async () => {
        await withServer(async (baseUrl) => {
            // Attempt to update user profile without token
            const response = await fetch(`${baseUrl}/api/v1/user`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Hacker' }),
            });

            // This assertion will FAIL initially because the route currently allows updating user 1
            // We want it to be 401
            expect(response.status).toBe(401);
        });
    });
});
