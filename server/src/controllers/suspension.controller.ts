import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import * as suspensionService from "../services/suspension.service.js";
import * as moderationService from "../services/moderation.service.js";

// ─── Suspension Controller ────────────────────────────────
// Thin layer — extracts HTTP data, calls service, returns response.

export const warnUser = asyncHandler(async (req: Request, res: Response) => {
    const targetUserId = req.params.id as string;
    const user = await suspensionService.warnUser(
        targetUserId,
        req.user!.userId,
        req.body.reason
    );

    res.status(200).json({
        success: true,
        message: "User warned successfully",
        data: { user },
    });
});

export const suspendUser = asyncHandler(
    async (req: Request, res: Response) => {
        const targetUserId = req.params.id as string;
        const user = await suspensionService.suspendUser(
            targetUserId,
            req.user!.userId,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "User suspended successfully",
            data: { user },
        });
    }
);

export const submitAppeal = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.params.id as string;

        // Users can only appeal for themselves
        if (userId !== req.user!.userId) {
            res.status(403).json({
                success: false,
                message: "You can only submit appeals for your own account",
            });
            return;
        }

        const user = await suspensionService.submitAppeal(
            userId,
            req.body.reason
        );

        res.status(200).json({
            success: true,
            message: "Appeal submitted successfully",
            data: { user },
        });
    }
);

export const reinstateUser = asyncHandler(
    async (req: Request, res: Response) => {
        const targetUserId = req.params.id as string;
        const user = await suspensionService.reinstateUser(
            targetUserId,
            req.user!.userId,
            req.body.reason
        );

        res.status(200).json({
            success: true,
            message: "User reinstated successfully",
            data: { user },
        });
    }
);

export const getSuspendedUsers = asyncHandler(
    async (req: Request, res: Response) => {
        const page = req.query.page
            ? parseInt(req.query.page as string, 10)
            : 1;
        const limit = req.query.limit
            ? parseInt(req.query.limit as string, 10)
            : 20;

        const result = await suspensionService.getSuspendedUsers(page, limit);

        res.status(200).json({
            success: true,
            data: result,
        });
    }
);

export const getAppeals = asyncHandler(
    async (req: Request, res: Response) => {
        const page = req.query.page
            ? parseInt(req.query.page as string, 10)
            : 1;
        const limit = req.query.limit
            ? parseInt(req.query.limit as string, 10)
            : 20;

        const result = await suspensionService.getAppeals(page, limit);

        res.status(200).json({
            success: true,
            data: result,
        });
    }
);

export const getRepeatOffenders = asyncHandler(
    async (req: Request, res: Response) => {
        const page = req.query.page
            ? parseInt(req.query.page as string, 10)
            : 1;
        const limit = req.query.limit
            ? parseInt(req.query.limit as string, 10)
            : 20;

        const result = await suspensionService.getRepeatOffenders(page, limit);

        res.status(200).json({
            success: true,
            data: result,
        });
    }
);

export const getAuditHistory = asyncHandler(
    async (req: Request, res: Response) => {
        const page = req.query.page
            ? parseInt(req.query.page as string, 10)
            : 1;
        const limit = req.query.limit
            ? parseInt(req.query.limit as string, 10)
            : 20;

        const result = await moderationService.getAuditHistory(page, limit);

        res.status(200).json({
            success: true,
            data: result,
        });
    }
);
