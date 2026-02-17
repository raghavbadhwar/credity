import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import type { Server } from 'http';
import reputationRouter from '../server/routes/reputation';

// Mock dependencies
vi.mock('../server/storage', () => ({
  storage: {
    getUser: vi.fn().mockResolvedValue({ id: 1 }),
  }
}));

vi.mock('../server/services/liveness-service', () => ({
  getUserLivenessStatus: vi.fn().mockReturnValue({ verified: true }),
}));

vi.mock('../server/services/document-scanner-service', () => ({
  getDocumentVerificationStatus: vi.fn().mockReturnValue({ verified: true }),
}));

vi.mock('../server/services/reputation-rail-service', () => ({
  calculateReputationScore: vi.fn().mockReturnValue({ score: 500 }),
  calculateSafeDateScore: vi.fn().mockReturnValue({ score: 80 }),
  deriveSafeDateInputs: vi.fn().mockReturnValue({}),
  listReputationEvents: vi.fn().mockReturnValue([]),
  upsertReputationEvent: vi.fn().mockReturnValue({
    accepted: true,
    duplicate: false,
    event: { user_id: 1, id: 'test-event' }
  }),
}));

describe('Reputation API Security', () => {
  let server: Server;
  let port: number;
  let baseUrl: string;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/reputation', reputationRouter);

    server = createServer(app);

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const address = server.address();
        if (typeof address === 'object' && address !== null) {
          port = address.port;
          baseUrl = `http://localhost:${port}/api/reputation`;
        }
        resolve();
      });
    });
  });

  afterAll(() => {
    server.close();
  });

  it('should DENY POST /events with 503 if REPUTATION_WRITE_API_KEY is not configured', async () => {
    // Ensure the environment variable is NOT set
    vi.stubEnv('REPUTATION_WRITE_API_KEY', '');

    const response = await fetch(`${baseUrl}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: 1,
        platform_id: 'test-platform',
        category: 'social',
        signal_type: 'test-signal',
        score: 50
      })
    });

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.error).toBe('Reputation write API not configured');
  });

  it('should ALLOW POST /events with CORRECT key when REPUTATION_WRITE_API_KEY is configured', async () => {
    vi.stubEnv('REPUTATION_WRITE_API_KEY', 'secure-key-123');

    const response = await fetch(`${baseUrl}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'secure-key-123'
      },
      body: JSON.stringify({
        user_id: 1,
        platform_id: 'test-platform',
        category: 'social',
        signal_type: 'test-signal',
        score: 50
      })
    });

    expect(response.status).toBe(201);
  });

  it('should DENY POST /events with INCORRECT key when REPUTATION_WRITE_API_KEY is configured', async () => {
    vi.stubEnv('REPUTATION_WRITE_API_KEY', 'secure-key-123');

    const response = await fetch(`${baseUrl}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'wrong-key'
      },
      body: JSON.stringify({
        user_id: 1,
        platform_id: 'test-platform',
        category: 'social',
        signal_type: 'test-signal',
        score: 50
      })
    });

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Invalid platform write API key');
  });
});
