import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Handle Zod Validation Errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: "Validation Error",
            errors: err.errors
        });
    }

    // Handle JWT Auth Errors
    if (err.name === 'UnauthorizedError' || err.message === 'jwt malformed') {
        return res.status(401).json({ message: "Invalid or Expired Token" });
    }

    console.error(`[Error] ${req.method} ${req.path}:`, err);

    // Ensure response hasn't proved yet
    if (!res.headersSent) {
        res.status(status).json({ message });
    }
}

// Wrapper for async route handlers
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
