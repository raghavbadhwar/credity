import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface VerificationRecord {
  id: string;
  credentialType: string;
  issuer: string;
  subject: string;
  status: string;
  riskScore: number;
  fraudScore: number;
  recommendation: string;
  timestamp: Date;
  verifiedBy: string;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Verification methods
  addVerification(record: VerificationRecord): Promise<void>;
  getVerifications(filters?: { status?: string; startDate?: Date; endDate?: Date }): Promise<VerificationRecord[]>;
  getVerification(id: string): Promise<VerificationRecord | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private verifications: VerificationRecord[];

  constructor() {
    this.users = new Map();
    this.verifications = [];
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async addVerification(record: VerificationRecord): Promise<void> {
    this.verifications.unshift(record);
    if (this.verifications.length > 1000) {
      this.verifications.pop();
    }
  }

  async getVerifications(filters?: { status?: string; startDate?: Date; endDate?: Date }): Promise<VerificationRecord[]> {
    let results = [...this.verifications];

    if (filters?.status) {
      results = results.filter(r => r.status === filters.status);
    }
    if (filters?.startDate) {
      results = results.filter(r => r.timestamp >= filters.startDate!);
    }
    if (filters?.endDate) {
      results = results.filter(r => r.timestamp <= filters.endDate!);
    }

    return results;
  }

  async getVerification(id: string): Promise<VerificationRecord | undefined> {
    return this.verifications.find(r => r.id === id);
  }
}

export const storage = new MemStorage();
