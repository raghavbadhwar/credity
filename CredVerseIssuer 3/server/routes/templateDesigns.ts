import { Router } from "express";
import { storage } from "../storage";
import { apiKeyMiddleware } from "../auth";

const router = Router();
router.use("/template-designs", apiKeyMiddleware);

// List all template designs
router.get("/template-designs", async (req, res) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tenantId = (req as any).tenantId;
        const templates = await storage.listTemplateDesigns(tenantId);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        res.json(templates);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch templates" });
    }
});

// Get single template design
router.get("/template-designs/:id", async (req, res) => {
    try {
        const template = await storage.getTemplateDesign(req.params.id);
        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        }
        res.json(template);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch template" });
    }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// Create new template design
router.post("/template-designs", async (req, res) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tenantId = (req as any).tenantId;
        const { name, category, type, fields, backgroundColor, width, height } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Template name is required" });
        }

        const template = await storage.createTemplateDesign({
            tenantId,
            name,
            category: category || "Education",
            type: type || "A4 Landscape",
            status: "Draft",
            fields: fields || [],
            backgroundColor: backgroundColor || "#ffffff",
            width: width || 842,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            height: height || 595
        });

        res.status(201).json(template);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        res.status(500).json({ message: "Failed to create template" });
    }
});

// Update template design
router.put("/template-designs/:id", async (req, res) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const template = await storage.getTemplateDesign(req.params.id);
        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tenantId = (req as any).tenantId;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        if (template.tenantId !== tenantId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const updated = await storage.updateTemplateDesign(req.params.id, req.body);
        res.json(updated);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        res.status(500).json({ message: "Failed to update template" });
    }
});

// Delete template design
// eslint-disable-next-line @typescript-eslint/no-explicit-any
router.delete("/template-designs/:id", async (req, res) => {
    try {
        const template = await storage.getTemplateDesign(req.params.id);
        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tenantId = (req as any).tenantId;
        if (template.tenantId !== tenantId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await storage.deleteTemplateDesign(req.params.id);
        res.json({ message: "Template deleted successfully" });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        res.status(500).json({ message: "Failed to delete template" });
    }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any

// Duplicate template design
router.post("/template-designs/:id/duplicate", async (req, res) => {
    try {
        const template = await storage.getTemplateDesign(req.params.id);
        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tenantId = (req as any).tenantId;
        if (template.tenantId !== tenantId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const duplicate = await storage.duplicateTemplateDesign(req.params.id);
        res.status(201).json(duplicate);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        res.status(500).json({ message: "Failed to duplicate template" });
    }
});

export default router;
