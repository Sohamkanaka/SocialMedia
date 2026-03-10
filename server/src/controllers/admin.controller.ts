import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import * as adminService from "../services/admin.service.js";

// ─── Admin Controller ─────────────────────────────────────
// Thin layer — extracts HTTP data, calls service, returns response.

export const getUsers = asyncHandler(
    async (req: Request, res: Response) => {
        const page = req.query.page
            ? parseInt(req.query.page as string, 10)
            : 1;
        const limit = req.query.limit
            ? parseInt(req.query.limit as string, 10)
            : 20;
        const filters = {
            search: req.query.search as string | undefined,
            role: req.query.role as string | undefined,
            accountStatus: req.query.accountStatus as string | undefined,
        };

        const result = await adminService.getUsers(page, limit, filters);

        res.status(200).json({
            success: true,
            data: result,
        });
    }
);

export const updateUserRole = asyncHandler(
    async (req: Request, res: Response) => {
        const targetUserId = req.params.id as string;
        const { role } = req.body;
        const performedByUserId = req.user!.userId;

        const result = await adminService.updateUserRole(
            targetUserId,
            role,
            performedByUserId
        );

        res.status(200).json({
            success: true,
            data: result,
            message: "User role updated successfully",
        });
    }
);

export const getSettings = asyncHandler(
    async (_req: Request, res: Response) => {
        const result = await adminService.getSettings();

        res.status(200).json({
            success: true,
            data: result,
        });
    }
);

export const updateSettings = asyncHandler(
    async (req: Request, res: Response) => {
        const performedByUserId = req.user!.userId;
        const { settings } = req.body;

        const result = await adminService.updateSettings(
            settings,
            performedByUserId
        );

        res.status(200).json({
            success: true,
            data: result,
            message: "Settings updated successfully",
        });
    }
);
