import { Request, Response, Router } from "express";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";
import { authMiddleware } from "../services/auth-service";
import { AuthUser } from "@credverse/shared-auth";

// Create custom Request type for the authenticated user
interface AuthenticatedRequest extends Request {
    user?: AuthUser;
}

const router = Router();

// Get current user profile
router.get("/user", authMiddleware as any, async (req: AuthenticatedRequest, res: Response) => {
    const userId = Number(req.user?.id);
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUser(userId);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
});

// Update user profile
router.patch("/user", authMiddleware as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = Number(req.user?.id);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const parseResult = insertUserSchema.partial().safeParse(req.body);

        if (!parseResult.success) {
            return res.status(400).json({ message: "Invalid user data", errors: parseResult.error });
        }

        const updatedUser = await storage.updateUser(userId, parseResult.data);
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get user activity
router.get("/activity", authMiddleware as any, async (req: AuthenticatedRequest, res: Response) => {
    const userId = Number(req.user?.id);
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const activities = await storage.listActivities(userId);
    res.json(activities);
});

export default router;
