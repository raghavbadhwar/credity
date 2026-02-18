import express from 'express';
import { beforeEach, describe, expect, it } from 'vitest';
import authRoutes from '../server/routes/auth';
import userRoutes from '../server/routes/user';
import { storage } from '../server/storage';

async function withServer<T>(handler: (baseUrl: string) => Promise<T>): Promise<T> {
    const app = express();
    app.use(express.json());
    // Mimic the main app structure
    app.use('/api/v1', authRoutes);
    app.use('/api/v1', userRoutes);

    const server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', resolve));

    const address = server.address();
    if (!address || typeof address === 'string') {
        throw new Error('Failed to bind auth test server');
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
        // Clear storage
        (storage as any).users = new Map();
        (storage as any).credentials = new Map();
        (storage as any).activities = new Map();
        (storage as any).currentUserId = 1;
        (storage as any).currentCredentialId = 1;
        (storage as any).currentActivityId = 1;
    });

    it('should deny access to /user without token', async () => {
        await withServer(async (baseUrl) => {
            const res = await fetch(`${baseUrl}/api/v1/user`);
            // Expect 401 Unauthorized
            expect(res.status).toBe(401);
        });
    });

    it('should allow access to /user with valid token', async () => {
        await withServer(async (baseUrl) => {
            // Register a user
            const register = await fetch(`${baseUrl}/api/v1/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'testuser',
                    password: 'StrongPassword1!',
                    email: 'test@example.com',
                }),
            });

            // Check registration success
            if (register.status !== 201) {
                console.error('Registration failed:', await register.text());
            }
            expect(register.status).toBe(201);

            const { tokens, user: registeredUser } = await register.json() as any;
            const accessToken = tokens.accessToken;

            // Access /user
            const res = await fetch(`${baseUrl}/api/v1/user`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            // Expect 200 OK
            if (res.status !== 200) {
                 console.error('User access failed:', await res.text());
            }
            expect(res.status).toBe(200);

            const user = await res.json() as any;
            expect(user.username).toBe('testuser');
            expect(user.id).toBe(registeredUser.id);
        });
    });
});
