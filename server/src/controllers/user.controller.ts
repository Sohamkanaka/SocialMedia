import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import * as userService from "../services/user.service.js";

// ─── User Controller ──────────────────────────────────────
// Thin layer — extracts HTTP data, calls service, returns response.

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id as string;
    const user = await userService.getProfile(userId, req.user?.userId);

    res.status(200).json({
        success: true,
        data: { user },
    });
});

export const getUserPosts = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.params.id as string;
        const cursor = req.query.cursor as string | undefined;
        const status = req.query.status as string | undefined;
        const limit = req.query.limit
            ? parseInt(req.query.limit as string, 10)
            : 10;

        const posts = await userService.getUserPosts(
            userId,
            req.user?.userId,
            cursor,
            limit,
            status
        );

        res.status(200).json({
            success: true,
            data: posts,
        });
    }
);

export const updateProfile = asyncHandler(
    async (req: Request, res: Response) => {
        const user = await userService.updateProfile(req.user!.userId, req.body);

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: { user },
        });
    }
);

export const followUser = asyncHandler(async (req: Request, res: Response) => {
    const targetId = req.params.id as string;
    await userService.followUser(req.user!.userId, targetId);

    res.status(201).json({
        success: true,
        message: "Followed successfully",
    });
});

export const unfollowUser = asyncHandler(
    async (req: Request, res: Response) => {
        const targetId = req.params.id as string;
        await userService.unfollowUser(req.user!.userId, targetId);

        res.status(200).json({
            success: true,
            message: "Unfollowed successfully",
        });
    }
);

export const getFollowers = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.params.id as string;
        const cursor = req.query.cursor as string | undefined;
        const limit = req.query.limit
            ? parseInt(req.query.limit as string, 10)
            : 20;

        const followers = await userService.getFollowers(
            userId,
            req.user?.userId,
            cursor,
            limit
        );

        res.status(200).json({
            success: true,
            data: followers,
        });
    }
);

export const getFollowing = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.params.id as string;
        const cursor = req.query.cursor as string | undefined;
        const limit = req.query.limit
            ? parseInt(req.query.limit as string, 10)
            : 20;

        const following = await userService.getFollowing(
            userId,
            req.user?.userId,
            cursor,
            limit
        );

        res.status(200).json({
            success: true,
            data: following,
        });
    }
);

export const getBookmarks = asyncHandler(
    async (req: Request, res: Response) => {
        const cursor = req.query.cursor as string | undefined;
        const limit = req.query.limit
            ? parseInt(req.query.limit as string, 10)
            : 10;

        const bookmarks = await userService.getBookmarks(
            req.user!.userId,
            cursor,
            limit
        );

        res.status(200).json({
            success: true,
            data: bookmarks,
        });
    }
);
