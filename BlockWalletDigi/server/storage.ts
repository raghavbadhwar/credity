import {
  type User, type InsertUser,
  type Credential, type InsertCredential,
  type Activity, type InsertActivity
} from "@shared/schema";
import { PostgresStateStore } from "@credverse/shared-auth";

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;

  // Credentials
  getCredential(id: number): Promise<Credential | undefined>;
  listCredentials(userId: number): Promise<Credential[]>;
  createCredential(credential: InsertCredential): Promise<Credential>;

  // Activities
  listActivities(userId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

interface WalletStorageState {
  users: Array<[number, User]>;
  credentials: Array<[number, Credential]>;
  activities: Array<[number, Activity]>;
  currentUserId: number;
  currentCredentialId: number;
  currentActivityId: number;
}

function parseDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return new Date();
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private credentials: Map<number, Credential>;
  private activities: Map<number, Activity>;
  private currentUserId: number;
  private currentCredentialId: number;
  private currentActivityId: number;

  // Secondary indices for O(1) lookups
  private usersByUsername: Map<string, number>;
  private credentialsByUserId: Map<number, number[]>;
  private activitiesByUserId: Map<number, number[]>;

  constructor() {
    this.users = new Map();
    this.credentials = new Map();
    this.activities = new Map();
    this.currentUserId = 1;
    this.currentCredentialId = 1;
    this.currentActivityId = 1;

    this.usersByUsername = new Map();
    this.credentialsByUserId = new Map();
    this.activitiesByUserId = new Map();
  }

  // User
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const id = this.usersByUsername.get(username);
    if (id === undefined) return undefined;
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      did: insertUser.did ?? null,
      name: insertUser.name ?? null,
      email: insertUser.email ?? null,
      bio: insertUser.bio ?? null,
      avatarUrl: insertUser.avatarUrl ?? null
    };
    this.users.set(id, user);
    this.usersByUsername.set(user.username, id);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");

    if (updates.username && updates.username !== user.username) {
      this.usersByUsername.delete(user.username);
      this.usersByUsername.set(updates.username, id);
    }

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Credentials
  async getCredential(id: number): Promise<Credential | undefined> {
    return this.credentials.get(id);
  }

  async listCredentials(userId: number): Promise<Credential[]> {
    const ids = this.credentialsByUserId.get(userId);
    if (!ids) return [];

    return ids
      .map(id => this.credentials.get(id))
      .filter((c): c is Credential => c !== undefined && !c.isArchived);
  }

  async createCredential(insertCredential: InsertCredential): Promise<Credential> {
    const id = this.currentCredentialId++;
    const credential: Credential = {
      ...insertCredential,
      id,
      jwt: insertCredential.jwt ?? null,
      isArchived: insertCredential.isArchived ?? false
    };
    this.credentials.set(id, credential);

    const userCreds = this.credentialsByUserId.get(credential.userId) || [];
    userCreds.push(id);
    this.credentialsByUserId.set(credential.userId, userCreds);

    return credential;
  }

  // Activities
  async listActivities(userId: number): Promise<Activity[]> {
    const ids = this.activitiesByUserId.get(userId);
    if (!ids) return [];

    return ids
      .map(id => this.activities.get(id))
      .filter((a): a is Activity => a !== undefined)
      .sort((a, b) => (b.timestamp?.getTime() ?? 0) - (a.timestamp?.getTime() ?? 0));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = {
      ...insertActivity,
      id,
      timestamp: new Date()
    };
    this.activities.set(id, activity);

    const userActs = this.activitiesByUserId.get(activity.userId) || [];
    userActs.push(id);
    this.activitiesByUserId.set(activity.userId, userActs);

    return activity;
  }

  exportState(): WalletStorageState {
    return {
      users: Array.from(this.users.entries()),
      credentials: Array.from(this.credentials.entries()),
      activities: Array.from(this.activities.entries()),
      currentUserId: this.currentUserId,
      currentCredentialId: this.currentCredentialId,
      currentActivityId: this.currentActivityId,
    };
  }

  importState(state: WalletStorageState): void {
    this.users = new Map((state.users || []).map(([key, value]) => [key, value]));
    this.credentials = new Map((state.credentials || []).map(([key, value]) => [key, {
      ...value,
      issuanceDate: parseDate((value as any).issuanceDate),
    }]));
    this.activities = new Map((state.activities || []).map(([key, value]) => [key, {
      ...value,
      timestamp: parseDate((value as any).timestamp),
    }]));
    this.currentUserId = state.currentUserId || 1;
    this.currentCredentialId = state.currentCredentialId || 1;
    this.currentActivityId = state.currentActivityId || 1;

    // Rebuild indices
    this.usersByUsername = new Map();
    this.credentialsByUserId = new Map();
    this.activitiesByUserId = new Map();

    for (const [id, user] of this.users) {
      this.usersByUsername.set(user.username, id);
    }

    for (const [id, cred] of this.credentials) {
      const list = this.credentialsByUserId.get(cred.userId) || [];
      list.push(id);
      this.credentialsByUserId.set(cred.userId, list);
    }

    for (const [id, act] of this.activities) {
      const list = this.activitiesByUserId.get(act.userId) || [];
      list.push(id);
      this.activitiesByUserId.set(act.userId, list);
    }
  }
}

const requirePersistentStorage =
  process.env.NODE_ENV === "production" || process.env.REQUIRE_DATABASE === "true";
const databaseUrl = process.env.DATABASE_URL;

if (requirePersistentStorage && !databaseUrl) {
  throw new Error(
    "[Storage] REQUIRE_DATABASE policy is enabled but DATABASE_URL is missing."
  );
}

function createPersistedStorage(base: MemStorage, dbUrl?: string): MemStorage {
  if (!dbUrl) {
    return base;
  }

  const stateStore = new PostgresStateStore<WalletStorageState>({
    databaseUrl: dbUrl,
    serviceKey: "wallet-storage",
  });

  let hydrated = false;
  let hydrationPromise: Promise<void> | null = null;
  let persistChain = Promise.resolve();
  const mutatingPrefixes = ["create", "update", "delete", "revoke", "bulk"];

  const ensureHydrated = async () => {
    if (hydrated) return;
    if (!hydrationPromise) {
      hydrationPromise = (async () => {
        const loaded = await stateStore.load();
        if (loaded) {
          base.importState(loaded);
        } else {
          await stateStore.save(base.exportState());
        }
        hydrated = true;
      })();
    }
    await hydrationPromise;
  };

  const queuePersist = async () => {
    persistChain = persistChain
      .then(async () => {
        await stateStore.save(base.exportState());
      })
      .catch((error) => {
        console.error("[Storage] Failed to persist wallet state:", error);
      });
    await persistChain;
  };

  return new Proxy(base, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== "function") {
        return value;
      }

      return async (...args: unknown[]) => {
        await ensureHydrated();
        const result = await value.apply(target, args);
        const shouldPersist = mutatingPrefixes.some(
          (prefix) => typeof prop === "string" && prop.startsWith(prefix),
        );
        if (shouldPersist) {
          await queuePersist();
        }
        return result;
      };
    },
  }) as MemStorage;
}

export const storage = createPersistedStorage(new MemStorage(), databaseUrl);
