import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import * as postService from "../services/post.service.js";

// ─── Post Controller ──────────────────────────────────────
// Thin layer — extracts HTTP data, calls service, returns response.

export const createPost = asyncHandler(async (req: Request, res: Response) => {
    const post = await postService.createPost(req.user!.userId, req.body);

    res.status(201).json({
        success: true,
        message: "Post created successfully",
        data: { post },
    });
});

export const getFeed = asyncHandler(async (req: Request, res: Response) => {
    const cursor = req.query.cursor as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    const feed = await postService.getFeed(req.user!.userId, cursor, limit);

    res.status(200).json({
        success: true,
        data: feed,
    });
});

export const getPost = asyncHandler(async (req: Request, res: Response) => {
    const postId = req.params.id as string;
    const post = await postService.getPost(postId, req.user?.userId);

    res.status(200).json({
        success: true,
        data: { post },
    });
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
    const postId = req.params.id as string;
    const post = await postService.updatePost(
        postId,
        req.user!.userId,
        req.body
    );

    res.status(200).json({
        success: true,
        message: "Post updated successfully",
        data: { post },
    });
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
    const postId = req.params.id as string;
    await postService.deletePost(postId, req.user!.userId, req.user!.role);

    res.status(200).json({
        success: true,
        message: "Post deleted successfully",
    });
});

export const updatePostStatus = asyncHandler(
    async (req: Request, res: Response) => {
        const postId = req.params.id as string;
        const post = await postService.updatePostStatus(
            postId,
            req.user!.userId,
            req.body.status
        );

        res.status(200).json({
            success: true,
            message: "Post status updated successfully",
            data: { post },
        });
    }
);

export const likePost = asyncHandler(async (req: Request, res: Response) => {
    const postId = req.params.id as string;
    await postService.likePost(req.user!.userId, postId);

    res.status(201).json({
        success: true,
        message: "Post liked",
    });
});

export const unlikePost = asyncHandler(async (req: Request, res: Response) => {
    const postId = req.params.id as string;
    await postService.unlikePost(req.user!.userId, postId);

    res.status(200).json({
        success: true,
        message: "Post unliked",
    });
});

export const bookmarkPost = asyncHandler(
    async (req: Request, res: Response) => {
        const postId = req.params.id as string;
        await postService.bookmarkPost(req.user!.userId, postId);

        res.status(201).json({
            success: true,
            message: "Post bookmarked",
        });
    }
);

export const unbookmarkPost = asyncHandler(
    async (req: Request, res: Response) => {
        const postId = req.params.id as string;
        await postService.unbookmarkPost(req.user!.userId, postId);

        res.status(200).json({
            success: true,
            message: "Post unbookmarked",
        });
    }
);

export const repostPost = asyncHandler(async (req: Request, res: Response) => {
    const postId = req.params.id as string;
    await postService.repostPost(req.user!.userId, postId);

    res.status(201).json({
        success: true,
        message: "Post reposted",
    });
});

export const unrepostPost = asyncHandler(
    async (req: Request, res: Response) => {
        const postId = req.params.id as string;
        await postService.unrepostPost(req.user!.userId, postId);

        res.status(200).json({
            success: true,
            message: "Post unreposted",
        });
    }
);
