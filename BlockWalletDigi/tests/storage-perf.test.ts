import { describe, expect, it } from 'vitest';
import { MemStorage } from '../server/storage';

describe('Wallet storage performance indices', () => {
  it('correctly manages indices for user lookups', async () => {
    const storage = new MemStorage();

    // Create user
    const user = await storage.createUser({
      username: 'test_user',
      password: 'password',
    } as any);

    // Verify lookup works
    const found = await storage.getUserByUsername('test_user');
    expect(found?.id).toBe(user.id);

    // Update username
    await storage.updateUser(user.id, { username: 'updated_user' });

    // Verify old username lookup returns undefined
    const old = await storage.getUserByUsername('test_user');
    expect(old).toBeUndefined();

    // Verify new username lookup works
    const newFound = await storage.getUserByUsername('updated_user');
    expect(newFound?.id).toBe(user.id);
  });

  it('correctly manages indices for credentials', async () => {
    const storage = new MemStorage();
    const user1 = await storage.createUser({ username: 'u1', password: 'p' } as any);
    const user2 = await storage.createUser({ username: 'u2', password: 'p' } as any);

    // Create credentials
    const c1 = await storage.createCredential({ userId: user1.id, type: [], issuer: 'i1', issuanceDate: new Date(), data: {} } as any);
    const c2 = await storage.createCredential({ userId: user2.id, type: [], issuer: 'i2', issuanceDate: new Date(), data: {} } as any);
    const c3 = await storage.createCredential({ userId: user1.id, type: [], issuer: 'i3', issuanceDate: new Date(), data: {} } as any);

    // List for user 1
    const list1 = await storage.listCredentials(user1.id);
    expect(list1).toHaveLength(2);
    expect(list1.map(c => c.id).sort()).toEqual([c1.id, c3.id].sort());

    // List for user 2
    const list2 = await storage.listCredentials(user2.id);
    expect(list2).toHaveLength(1);
    expect(list2[0].id).toBe(c2.id);
  });

  it('rebuilds indices after importState', async () => {
    const source = new MemStorage();
    const user = await source.createUser({ username: 'import_test', password: 'p' } as any);
    await source.createCredential({ userId: user.id, issuer: 'i', issuanceDate: new Date(), data: {} } as any);

    const snapshot = source.exportState();
    const target = new MemStorage();
    target.importState(snapshot);

    // Verify lookups work on target
    const foundUser = await target.getUserByUsername('import_test');
    expect(foundUser?.id).toBe(user.id);

    const creds = await target.listCredentials(user.id);
    expect(creds).toHaveLength(1);
  });
});
