import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import * as moderationService from "../services/moderation.service.js";

// ─── Moderation Controller ────────────────────────────────
// Thin layer — extracts HTTP data, calls service, returns response.

export const getModerationQueue = asyncHandler(
    async (req: Request, res: Response) => {
        const page = req.query.page
            ? parseInt(req.query.page as string, 10)
            : 1;
        const limit = req.query.limit
            ? parseInt(req.query.limit as string, 10)
            : 20;
        const filters = {
            status: req.query.status as string | undefined,
            communityId: req.query.communityId as string | undefined,
        };

        const result = await moderationService.getModerationQueue(
            page,
            limit,
            filters
        );

        res.status(200).json({
            success: true,
            data: result,
        });
    }
);

export const approvePost = asyncHandler(
    async (req: Request, res: Response) => {
        const postId = req.params.postId as string;
        const result = await moderationService.approvePost(
            postId,
            req.user!.userId,
            req.body.reason
        );

        res.status(200).json({
            success: true,
            message: result.message,
        });
    }
);

export const removePost = asyncHandler(
    async (req: Request, res: Response) => {
        const postId = req.params.postId as string;
        const result = await moderationService.removePost(
            postId,
            req.user!.userId,
            req.body.reason
        );

        res.status(200).json({
            success: true,
            message: result.message,
        });
    }
);

export const warnUser = asyncHandler(
    async (req: Request, res: Response) => {
        const postId = req.params.postId as string;
        const result = await moderationService.warnUser(
            postId,
            req.user!.userId,
            req.body.reason
        );

        res.status(200).json({
            success: true,
            message: result.message,
        });
    }
);

export const escalatePost = asyncHandler(
    async (req: Request, res: Response) => {
        const postId = req.params.postId as string;
        const result = await moderationService.escalatePost(
            postId,
            req.user!.userId,
            req.body.reason
        );

        res.status(200).json({
            success: true,
            message: result.message,
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
        const filters = {
            targetUserId: req.query.targetUserId as string | undefined,
            performedBy: req.query.performedBy as string | undefined,
            actionType: req.query.actionType as string | undefined,
        };

        const result = await moderationService.getAuditHistory(
            page,
            limit,
            filters
        );

        res.status(200).json({
            success: true,
            data: result,
        });
    }
);
