import express from 'express';
import { beforeEach, describe, expect, it } from 'vitest';
import complianceRoutes from '../server/routes/compliance';
import { resetWalletServiceStoreForTests } from '../server/services/wallet-service';

async function withServer<T>(handler: (baseUrl: string) => Promise<T>): Promise<T> {
  const app = express();
  app.use(express.json());
  app.use('/api', complianceRoutes);

  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to bind compliance test server');
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

describe('wallet compliance routes', () => {
  beforeEach(() => {
    resetWalletServiceStoreForTests();
  });

  it('creates, lists, and revokes consent grants', async () => {
    await withServer(async (baseUrl) => {
      const created = await fetch(`${baseUrl}/api/compliance/consents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1,
          verifierId: 'recruiter-1',
          purpose: 'job-screening',
          dataElements: ['name', 'degree', 'graduationYear'],
          expiry: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        }),
      });

      expect(created.status).toBe(201);
      const consent = (await created.json()) as { id: string; revocation_ts: string | null };
      expect(consent.id).toBeTruthy();
      expect(consent.revocation_ts).toBeNull();

      const listed = await fetch(`${baseUrl}/api/compliance/consents?userId=1`);
      expect(listed.status).toBe(200);
      const listedBody = (await listed.json()) as { count: number };
      expect(listedBody.count).toBe(1);

      const revoked = await fetch(`${baseUrl}/api/compliance/consents/${consent.id}/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1 }),
      });
      expect(revoked.status).toBe(200);
      const revokedBody = (await revoked.json()) as { revocation_ts: string | null };
      expect(revokedBody.revocation_ts).not.toBeNull();
    });
  });

  it('handles DPDP export/delete workflow and CERT-In incident timer metadata', async () => {
    await withServer(async (baseUrl) => {
      const exportRequest = await fetch(`${baseUrl}/api/compliance/data-requests/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 2, reason: 'data portability request' }),
      });
      expect(exportRequest.status).toBe(202);
      const exportBody = (await exportRequest.json()) as {
        status: string;
        result?: Record<string, unknown>;
      };
      expect(exportBody.status).toBe('completed');
      expect(exportBody.result).toBeDefined();

      const deleteRejected = await fetch(`${baseUrl}/api/compliance/data-requests/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 2 }),
      });
      expect(deleteRejected.status).toBe(400);

      const deleteAccepted = await fetch(`${baseUrl}/api/compliance/data-requests/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 2, confirm: 'DELETE' }),
      });
      expect(deleteAccepted.status).toBe(202);

      const incidentCreated = await fetch(`${baseUrl}/api/compliance/certin/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'unauthorized_access',
          severity: 'high',
        }),
      });
      expect(incidentCreated.status).toBe(201);
      const incidentBody = (await incidentCreated.json()) as { log_retention_days: number };
      expect(incidentBody.log_retention_days).toBe(180);

      const incidents = await fetch(`${baseUrl}/api/compliance/certin/incidents`);
      expect(incidents.status).toBe(200);
      const incidentsBody = (await incidents.json()) as {
        count: number;
        incidents: Array<{ seconds_to_report_due: number }>;
      };
      expect(incidentsBody.count).toBe(1);
      expect(incidentsBody.incidents[0]?.seconds_to_report_due).toBeGreaterThan(0);
    });
  });
});
