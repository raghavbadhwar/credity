import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  did: text("did"),
  name: text("name"),
  email: text("email"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
});

export const credentials = pgTable("credentials", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Foreign key to users
  type: jsonb("type").notNull(), // Array of types, e.g., ["VerifiableCredential", "UniversityDegree"]
  issuer: text("issuer").notNull(),
  issuanceDate: timestamp("issuance_date").notNull(),
  data: jsonb("data").notNull(), // The credential subject data
  jwt: text("jwt"), // The raw VC-JWT
  isArchived: boolean("is_archived").default(false),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // "receive", "share", "connect"
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  did: true,
  name: true,
  email: true,
  bio: true,
  avatarUrl: true,
});

export const insertCredentialSchema = createInsertSchema(credentials).pick({
  userId: true,
  type: true,
  issuer: true,
  issuanceDate: true,
  data: true,
  jwt: true,
  isArchived: true,
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  type: true,
  description: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCredential = z.infer<typeof insertCredentialSchema>;
export type Credential = typeof credentials.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
