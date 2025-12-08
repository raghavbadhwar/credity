import {
  type User, type InsertUser,
  type Credential, type InsertCredential,
  type Activity, type InsertActivity
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private credentials: Map<number, Credential>;
  private activities: Map<number, Activity>;
  private currentUserId: number;
  private currentCredentialId: number;
  private currentActivityId: number;

  constructor() {
    this.users = new Map();
    this.credentials = new Map();
    this.activities = new Map();
    this.currentUserId = 1;
    this.currentCredentialId = 1;
    this.currentActivityId = 1;
  }

  // User
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
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
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Credentials
  async getCredential(id: number): Promise<Credential | undefined> {
    return this.credentials.get(id);
  }

  async listCredentials(userId: number): Promise<Credential[]> {
    return Array.from(this.credentials.values()).filter(
      (c) => c.userId === userId && !c.isArchived
    );
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
    return credential;
  }

  // Activities
  async listActivities(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter((a) => a.userId === userId)
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
    return activity;
  }
}

export const storage = new MemStorage();
