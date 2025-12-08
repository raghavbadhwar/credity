import type { Express } from "express";
import { type Server } from "http";
import verificationRoutes from "./routes/verification";
import analyticsRoutes from "./routes/analytics";
import authRoutes from "./routes/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Verification routes
  app.use("/api", verificationRoutes);
  app.use("/api", analyticsRoutes);
  app.use("/api", authRoutes);

  return httpServer;
}
