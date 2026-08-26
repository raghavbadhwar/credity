import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createServer } from 'http';
import { registerRoutes } from '../server/routes';
import { storage } from '../server/storage';
import { errorHandler } from '../server/middleware/error-handler';

// Setup app for testing
const app = express();
app.use(express.json());
const httpServer = createServer(app);

// Use top-level await if supported, or wrap in describe/beforeAll
await registerRoutes(httpServer, app);
app.use(errorHandler);

describe('Security Reproduction: Privilege Escalation', () => {
    beforeEach(() => {
        // Clear storage
        (storage as any).users.clear();
    });

    it('should NOT allow privilege escalation by injecting role field', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: 'hacker',
                password: 'password123',
                role: 'admin'
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);

        // Regression test: the user should NOT be an admin, but a user
        expect(res.body.user.role).toBe('user');
        expect(res.body.user.role).not.toBe('admin');

        // Double check by fetching the user directly from storage if possible
        const user = await storage.getUserByUsername('hacker');
        expect(user).toBeDefined();
        expect(user!.role).toBe('user');
    });
});
