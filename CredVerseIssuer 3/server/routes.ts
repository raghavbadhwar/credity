import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import registryRoutes from "./routes/registry";
import templateRoutes from "./routes/templates";
import issuanceRoutes from "./routes/issuance";
import verifyRoutes from "./routes/verify";
import analyticsRoutes from "./routes/analytics";
import studentsRoutes from "./routes/students";
import teamRoutes from "./routes/team";
import templateDesignsRoutes from "./routes/templateDesigns";
import verificationLogsRoutes from "./routes/verificationLogs";
import exportsRoutes from "./routes/exports";
import activityLogsRoutes from "./routes/activityLogs";
import digilockerRoutes from "./routes/digilocker";
import authRoutes from "./routes/auth";
import publicRoutes from "./routes/public";
import twoFactorRoutes from "./routes/two-factor";
import { initQueueService, startIssuanceWorker } from "./services/queue-service";
import { issuanceService } from "./services/issuance";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize queue service for bulk operations
  const queueAvailable = await initQueueService();
  if (queueAvailable) {
    // Start the worker to process bulk issuance jobs
    startIssuanceWorker(async (tenantId, templateId, issuerId, recipient, data) => {
      await issuanceService.issueCredential(tenantId, templateId, issuerId, recipient, data);
    });
  }

  // Health check endpoint for Railway
  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // put application routes here
  // prefix all routes with /api
  app.use("/api/v1/public", publicRoutes); // Mount public routes
  // auth routes first
  app.use("/api/v1", authRoutes);
  app.use("/api/v1", twoFactorRoutes); // 2FA routes
  app.use("/api/v1", registryRoutes);
  app.use("/api/v1", templateRoutes);
  app.use("/api/v1", issuanceRoutes);
  app.use("/api/v1", verifyRoutes);
  app.use("/api/v1", analyticsRoutes);
  app.use("/api/v1", studentsRoutes);
  app.use("/api/v1", teamRoutes);
  app.use("/api/v1", templateDesignsRoutes);
  app.use("/api/v1", verificationLogsRoutes);
  app.use("/api/v1", exportsRoutes);
  app.use("/api/v1", activityLogsRoutes);
  app.use("/api/v1", digilockerRoutes);


  return httpServer;
}
