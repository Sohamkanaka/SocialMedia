import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import * as notificationService from "../services/notification.service.js";

// ─── Notification Controller ──────────────────────────────
// Thin layer — extracts HTTP data, calls service, returns response.

export const getNotifications = asyncHandler(
    async (req: Request, res: Response) => {
        const cursor = req.query.cursor as string | undefined;
        const limit = req.query.limit
            ? parseInt(req.query.limit as string, 10)
            : 20;

        const notifications = await notificationService.getNotifications(
            req.user!.userId,
            cursor,
            limit
        );

        res.status(200).json({
            success: true,
            data: notifications,
        });
    }
);

export const getUnreadCount = asyncHandler(
    async (req: Request, res: Response) => {
        const count = await notificationService.getUnreadCount(req.user!.userId);

        res.status(200).json({
            success: true,
            data: { count },
        });
    }
);

export const markAsRead = asyncHandler(
    async (req: Request, res: Response) => {
        const id = req.params.id as string;
        await notificationService.markAsRead(id, req.user!.userId);

        res.status(200).json({
            success: true,
            message: "Notification marked as read",
        });
    }
);

export const markAllAsRead = asyncHandler(
    async (req: Request, res: Response) => {
        await notificationService.markAllAsRead(req.user!.userId);

        res.status(200).json({
            success: true,
            message: "All notifications marked as read",
        });
    }
);
