import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/errorHandler.js";

// ─── Generic Zod Validation Middleware (request body) ──────

export const validate = (schema: z.ZodSchema) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const fieldErrors: Record<string, string[]> = {};
            for (const issue of result.error.issues) {
                const field = issue.path.join(".");
                if (!fieldErrors[field]) {
                    fieldErrors[field] = [];
                }
                fieldErrors[field].push(issue.message);
            }

            throw new AppError("Validation failed", 400, fieldErrors);
        }

        req.body = result.data;
        next();
    };
};

// ─── Generic Zod Validation Middleware (query params) ──────

export const validateQuery = (schema: z.ZodSchema) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.query);

        if (!result.success) {
            const fieldErrors: Record<string, string[]> = {};
            for (const issue of result.error.issues) {
                const field = issue.path.join(".");
                if (!fieldErrors[field]) {
                    fieldErrors[field] = [];
                }
                fieldErrors[field].push(issue.message);
            }

            throw new AppError("Validation failed", 400, fieldErrors);
        }

        // Merge validated data back into query (cannot reassign req.query directly — it's a read-only getter)
        Object.assign(req.query, result.data);
        next();
    };
};
