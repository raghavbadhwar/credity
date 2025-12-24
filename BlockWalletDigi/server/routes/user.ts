import { Router } from "express";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";
import { authMiddleware } from "../services/auth-service";

const router = Router();

// Get current user profile
router.get("/user", authMiddleware, async (req, res) => {
    const userId = req.user!.userId;
    const user = await storage.getUser(userId);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
});

// Update user profile
router.patch("/user", authMiddleware, async (req, res) => {
    try {
        const userId = req.user!.userId;

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
router.get("/activity", authMiddleware, async (req, res) => {
    const userId = req.user!.userId;
    const activities = await storage.listActivities(userId);
    res.json(activities);
});

export default router;
