import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import * as communityService from "../services/community.service.js";

// ─── Community Controller ─────────────────────────────────
// Thin layer — extracts HTTP data, calls service, returns response.

export const createCommunity = asyncHandler(
    async (req: Request, res: Response) => {
        const community = await communityService.createCommunity(
            req.user!.userId,
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Community created successfully",
            data: { community },
        });
    }
);

export const listCommunities = asyncHandler(
    async (req: Request, res: Response) => {
        const cursor = req.query.cursor as string | undefined;
        const limit = req.query.limit
            ? parseInt(req.query.limit as string, 10)
            : 20;

        const communities = await communityService.listCommunities(cursor, limit);

        res.status(200).json({
            success: true,
            data: communities,
        });
    }
);

export const getCommunity = asyncHandler(
    async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const community = await communityService.getCommunityDetails(
            id,
            req.user?.userId
        );

        res.status(200).json({
            success: true,
            data: { community },
        });
    }
);

export const getCommunityFeed = asyncHandler(
    async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const cursor = req.query.cursor as string | undefined;
        const limit = req.query.limit
            ? parseInt(req.query.limit as string, 10)
            : 10;

        const feed = await communityService.getCommunityFeed(id, cursor, limit);

        res.status(200).json({
            success: true,
            data: feed,
        });
    }
);

export const joinCommunity = asyncHandler(
    async (req: Request, res: Response) => {
        const id = req.params.id as string;
        await communityService.joinCommunity(req.user!.userId, id);

        res.status(201).json({
            success: true,
            message: "Joined community successfully",
        });
    }
);

export const leaveCommunity = asyncHandler(
    async (req: Request, res: Response) => {
        const id = req.params.id as string;
        await communityService.leaveCommunity(req.user!.userId, id);

        res.status(200).json({
            success: true,
            message: "Left community successfully",
        });
    }
);

export const getMembers = asyncHandler(
    async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const cursor = req.query.cursor as string | undefined;
        const limit = req.query.limit
            ? parseInt(req.query.limit as string, 10)
            : 20;

        const members = await communityService.getMembers(id, cursor, limit);

        res.status(200).json({
            success: true,
            data: members,
        });
    }
);

export const updateMemberRole = asyncHandler(
    async (req: Request, res: Response) => {
        const communityId = req.params.id as string;
        const targetUserId = req.params.userId as string;

        const member = await communityService.updateMemberRole(
            req.user!.userId,
            communityId,
            targetUserId,
            req.body.role
        );

        res.status(200).json({
            success: true,
            message: "Member role updated successfully",
            data: { member },
        });
    }
);
