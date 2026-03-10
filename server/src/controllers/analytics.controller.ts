import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import * as analyticsService from "../services/analytics.service.js";

// ─── Analytics Controller ─────────────────────────────────
// Thin layer — extracts HTTP data, calls service, returns response.

export const getCreatorAnalytics = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const days = req.query.days
            ? parseInt(req.query.days as string, 10)
            : 30;

        const result = await analyticsService.getCreatorAnalytics(userId, days);

        res.status(200).json({
            success: true,
            data: result,
        });
    }
);

export const getAdminAnalytics = asyncHandler(
    async (req: Request, res: Response) => {
        const days = req.query.days
            ? parseInt(req.query.days as string, 10)
            : 30;

        const result = await analyticsService.getAdminAnalytics(days);

        res.status(200).json({
            success: true,
            data: result,
        });
    }
);
