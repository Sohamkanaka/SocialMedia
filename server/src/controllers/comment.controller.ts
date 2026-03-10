import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import * as commentService from "../services/comment.service.js";

// ─── Comment Controller ───────────────────────────────────
// Thin layer — extracts HTTP data, calls service, returns response.

export const addComment = asyncHandler(async (req: Request, res: Response) => {
    const postId = req.params.id as string;
    const { content, parentId } = req.body;

    const comment = await commentService.addComment(
        req.user!.userId,
        postId,
        content,
        parentId
    );

    res.status(201).json({
        success: true,
        message: "Comment added successfully",
        data: { comment },
    });
});

export const getComments = asyncHandler(async (req: Request, res: Response) => {
    const postId = req.params.id as string;
    const cursor = req.query.cursor as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const comments = await commentService.getComments(postId, cursor, limit);

    res.status(200).json({
        success: true,
        data: comments,
    });
});
