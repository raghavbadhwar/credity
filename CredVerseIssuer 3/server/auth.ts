import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { z } from "zod";

// Simple in-memory rate limiter for MVP
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 1000; // 1000 requests per minute

export async function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
    const apiKeyHeader = req.headers["x-api-key"];

    if (!apiKeyHeader || typeof apiKeyHeader !== "string") {
        return res.status(401).json({ message: "Missing or invalid API Key" });
    }

    // In a real app, we would hash the key from the header and compare it with the stored hash
    // For MVP, we'll assume the header sends the hash directly or we store plain keys (NOT RECOMMENDED FOR PROD)
    // Let's assume we store the key directly for this MVP to keep it simple, or we'd need a hashing helper.
    // Ideally: const keyHash = hash(apiKeyHeader);
    const keyHash = apiKeyHeader;

    const apiKey = await storage.getApiKey(keyHash);

    if (!apiKey) {
        return res.status(401).json({ message: "Invalid API Key" });
    }

    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
        return res.status(401).json({ message: "API Key expired" });
    }

    // Rate Limiting
    const now = Date.now();
    const limitData = rateLimitMap.get(keyHash) || { count: 0, lastReset: now };

    if (now - limitData.lastReset > RATE_LIMIT_WINDOW) {
        limitData.count = 0;
        limitData.lastReset = now;
    }

    limitData.count++;
    rateLimitMap.set(keyHash, limitData);

    if (limitData.count > RATE_LIMIT_MAX) {
        return res.status(429).json({ message: "Rate limit exceeded" });
    }

    // Attach tenantId to request
    (req as any).tenantId = apiKey.tenantId;
    next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    // TODO: Integrate with Passport.js or similar for real user sessions
    // For now, we'll assume if tenantId is present (via API key), it's "authenticated" for API access
    // Or if it's a browser session, we'd check req.session
    if ((req as any).tenantId || (req as any).user) {
        return next();
    }
    res.status(401).json({ message: "Unauthorized" });
}
