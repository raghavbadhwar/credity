import type { Express } from "express";
import { type Server } from "http";
import verificationRoutes from "./routes/verification";
import analyticsRoutes from "./routes/analytics";
import authRoutes from "./routes/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Health check endpoint for Railway
  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Verification routes
  app.use("/api", verificationRoutes);
  app.use("/api", analyticsRoutes);
  app.use("/api", authRoutes);

  return httpServer;
}
