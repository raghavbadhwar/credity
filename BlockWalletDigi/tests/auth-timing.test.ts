import express from 'express';
import { beforeEach, describe, expect, it } from 'vitest';
import authRoutes from '../server/routes/auth';
import { storage } from '../server/storage';

async function withServer<T>(handler: (baseUrl: string) => Promise<T>): Promise<T> {
    const app = express();
    app.use(express.json());
    app.use('/api', authRoutes);

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

describe('wallet auth timing analysis', () => {
    beforeEach(() => {
        (storage as any).users?.clear?.();
    });

    it('measures timing difference between user-found and user-not-found', async () => {
        await withServer(async (baseUrl) => {
            // Register a user
            await fetch(`${baseUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'existing_user',
                    password: 'StrongPass1!',
                    email: 'secure@example.com',
                }),
            });

            const iterations = 2;
            let totalFoundTime = 0;
            let totalNotFoundTime = 0;

            // Warm up
             await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'existing_user',
                    password: 'WrongPass1!',
                }),
            });

            for (let i = 0; i < iterations; i++) {
                // Case 1: User exists, wrong password (SLOW)
                const startFound = performance.now();
                await fetch(`${baseUrl}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: 'existing_user',
                        password: 'WrongPass1!',
                    }),
                });
                const endFound = performance.now();
                totalFoundTime += (endFound - startFound);

                // Case 2: User does not exist (FAST - vulnerable)
                const startNotFound = performance.now();
                await fetch(`${baseUrl}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: 'non_existent_user',
                        password: 'WrongPass1!',
                    }),
                });
                const endNotFound = performance.now();
                totalNotFoundTime += (endNotFound - startNotFound);
            }

            const avgFound = totalFoundTime / iterations;
            const avgNotFound = totalNotFoundTime / iterations;

            console.log(`Average time (User Found): ${avgFound.toFixed(2)}ms`);
            console.log(`Average time (User Not Found): ${avgNotFound.toFixed(2)}ms`);
            console.log(`Difference: ${(avgFound - avgNotFound).toFixed(2)}ms`);

            // In a vulnerable system, Found >> NotFound
            // Ideally, difference should be significant (e.g., > 50ms)
        });
    });
});
