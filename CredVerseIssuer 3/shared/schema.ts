import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const trustStatusEnum = pgEnum("trust_status", ["pending", "trusted", "revoked"]);

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  plan: text("plan").default("free"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  keyHash: text("key_hash").notNull(),
  permissions: jsonb("permissions").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const issuers = pgTable("issuers", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  domain: text("domain").notNull(),
  did: text("did"),
  trustStatus: trustStatusEnum("trust_status").default("pending"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const templates = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  schema: jsonb("schema").notNull(),
  render: text("render").notNull(), // Handlebars/Liquid template string
  version: text("version").default("1.0.0"),
  disclosure: jsonb("disclosure").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const credentials = pgTable("credentials", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  templateId: uuid("template_id").references(() => templates.id).notNull(),
  issuerId: uuid("issuer_id").references(() => issuers.id).notNull(),
  recipient: jsonb("recipient").notNull(), // { name, email, did }
  credentialData: jsonb("credential_data").notNull(), // The actual data
  vcJwt: text("vc_jwt"), // The signed VC
  ipfsHash: text("ipfs_hash"),
  anchorId: text("anchor_id"),
  revoked: boolean("revoked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTenantSchema = createInsertSchema(tenants);
export const insertApiKeySchema = createInsertSchema(apiKeys);
export const insertIssuerSchema = createInsertSchema(issuers);
export const insertUserSchema = createInsertSchema(users);
export const insertTemplateSchema = createInsertSchema(templates);
export const insertCredentialSchema = createInsertSchema(credentials);

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type Issuer = typeof issuers.$inferSelect;
export type InsertIssuer = z.infer<typeof insertIssuerSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type Credential = typeof credentials.$inferSelect;
export type InsertCredential = z.infer<typeof insertCredentialSchema>;
