import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import userRoutes from "./routes/user";
import digilockerRoutes from "./routes/digilocker";
import authRoutes from "./routes/auth";
import walletRoutes from "./routes/wallet";
import credentialsRoutes from "./routes/credentials";
import sharingRoutes from "./routes/sharing";
import notificationsRoutes from "./routes/notifications";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  app.use("/api", authRoutes);          // Authentication
  app.use("/api", walletRoutes);        // Wallet Core & DID
  app.use("/api", credentialsRoutes);   // Credential Management
  app.use("/api", sharingRoutes);       // Sharing & Verification
  app.use("/api", notificationsRoutes); // Inbox & Activity
  app.use("/api", userRoutes);          // User Management
  app.use("/api", digilockerRoutes);    // DigiLocker Integration

  const httpServer = createServer(app);

  return httpServer;
}



