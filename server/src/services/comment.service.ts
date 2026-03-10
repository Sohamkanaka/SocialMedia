import { AppError } from "../middleware/errorHandler.js";
import * as commentRepo from "../repositories/comment.repo.js";
import * as postRepo from "../repositories/post.repo.js";
import * as notificationService from "./notification.service.js";

// ─── Comment Service ──────────────────────────────────────
// Business logic only — no HTTP concerns, no direct DB calls.

// ─── Add Comment ───────────────────────────────────────────

export const addComment = async (
    userId: string,
    postId: string,
    content: string,
    parentId?: string
) => {
    const post = await postRepo.findById(postId);
    if (!post) {
        throw new AppError("Post not found", 404);
    }

    if (post.status !== "PUBLISHED") {
        throw new AppError("Cannot comment on a non-published post", 400);
    }

    // Validate parent comment exists and belongs to same post
    if (parentId) {
        const parent = await commentRepo.findById(parentId);
        if (!parent) {
            throw new AppError("Parent comment not found", 404);
        }
        if (parent.postId !== postId) {
            throw new AppError("Parent comment does not belong to this post", 400);
        }
    }

    const comment = await commentRepo.create({
        content,
        authorId: userId,
        postId,
        parentId,
    });

    // Notify post author about the comment (non-blocking)
    notificationService.createNotification({
        userId: post.authorId,
        actorId: userId,
        type: "COMMENT",
        message: "commented on your post",
        referenceId: postId,
        referenceType: "POST",
    });

    return comment;
};

// ─── Get Comments ──────────────────────────────────────────

export const getComments = async (
    postId: string,
    cursor?: string,
    limit?: number
) => {
    const post = await postRepo.findById(postId);
    if (!post) {
        throw new AppError("Post not found", 404);
    }

    return commentRepo.findByPostId(postId, cursor, limit);
};
