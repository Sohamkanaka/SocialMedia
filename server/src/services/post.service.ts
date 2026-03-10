import { AppError } from "../middleware/errorHandler.js";
import * as postRepo from "../repositories/post.repo.js";
import * as notificationService from "./notification.service.js";
import { Prisma } from "@prisma/client/index";

// ─── Post Service ─────────────────────────────────────────
// Business logic only — no HTTP concerns, no direct DB calls.

// ─── Create Post ───────────────────────────────────────────

export const createPost = async (
    userId: string,
    data: {
        title: string;
        content?: string;
        type?: string;
        status?: string;
        mediaUrl?: string;
        communityId?: string;
        scheduledAt?: string;
        pollOptions?: { text: string }[];
    }
) => {
    // Validate poll type has options
    if (data.type === "POLL" && (!data.pollOptions || data.pollOptions.length < 2)) {
        throw new AppError("Poll posts require at least 2 options", 400);
    }

    // Validate image/video type has media
    if ((data.type === "IMAGE" || data.type === "VIDEO") && !data.mediaUrl) {
        throw new AppError(`${data.type} posts require a media URL`, 400);
    }

    const post = await postRepo.create({
        ...data,
        type: data.type || "TEXT",
        status: data.status || "PUBLISHED",
        authorId: userId,
    });

    return post;
};

// ─── Get Feed ──────────────────────────────────────────────

export const getFeed = async (
    userId: string,
    cursor?: string,
    limit?: number
) => {
    return postRepo.findFeed(userId, cursor, limit);
};

// ─── Get Single Post ───────────────────────────────────────

export const getPost = async (postId: string, userId?: string) => {
    const post = await postRepo.findById(postId);
    if (!post) {
        throw new AppError("Post not found", 404);
    }

    // Non-authors can only see published posts
    if (post.status !== "PUBLISHED" && post.authorId !== userId) {
        throw new AppError("Post not found", 404);
    }

    // If user is authenticated, get their interactions
    let interactions = null;
    if (userId) {
        interactions = await postRepo.getUserInteractions(userId, postId);
    }

    return { ...post, interactions };
};

// ─── Update Post ───────────────────────────────────────────

export const updatePost = async (
    postId: string,
    userId: string,
    data: { title?: string; content?: string; mediaUrl?: string | null }
) => {
    const post = await postRepo.findById(postId);
    if (!post) {
        throw new AppError("Post not found", 404);
    }

    if (post.authorId !== userId) {
        throw new AppError("You can only edit your own posts", 403);
    }

    if (post.status === "ARCHIVED") {
        throw new AppError("Cannot edit an archived post", 400);
    }

    return postRepo.update(postId, data);
};

// ─── Delete Post (soft) ───────────────────────────────────

export const deletePost = async (postId: string, userId: string, userRole: string) => {
    const post = await postRepo.findById(postId);
    if (!post) {
        throw new AppError("Post not found", 404);
    }

    // Author or admin/moderator can delete
    const isOwner = post.authorId === userId;
    const isPrivileged = userRole === "ADMIN" || userRole === "MODERATOR";

    if (!isOwner && !isPrivileged) {
        throw new AppError("You do not have permission to delete this post", 403);
    }

    return postRepo.softDelete(postId);
};

// ─── Update Post Status ───────────────────────────────────

export const updatePostStatus = async (
    postId: string,
    userId: string,
    status: string
) => {
    const post = await postRepo.findById(postId);
    if (!post) {
        throw new AppError("Post not found", 404);
    }

    if (post.authorId !== userId) {
        throw new AppError("You can only change status of your own posts", 403);
    }

    // Validate lifecycle transitions
    const validTransitions: Record<string, string[]> = {
        DRAFT: ["PUBLISHED", "ARCHIVED"],
        PUBLISHED: ["ARCHIVED"],
        ARCHIVED: ["DRAFT", "PUBLISHED"], // no transitions from archived
    };

    const allowed = validTransitions[post.status] || [];
    if (!allowed.includes(status)) {
        throw new AppError(
            `Cannot transition from ${post.status} to ${status}`,
            400
        );
    }

    return postRepo.updateStatus(postId, status);
};

// ─── Like / Unlike ─────────────────────────────────────────

export const likePost = async (userId: string, postId: string) => {
    const post = await postRepo.findById(postId);
    if (!post) {
        throw new AppError("Post not found", 404);
    }

    try {
        const result = await postRepo.like(userId, postId);
        notificationService.createNotification({
            userId: post.authorId,
            actorId: userId,
            type: "LIKE",
            message: "liked your post",
            referenceId: postId,
            referenceType: "POST",
        });
        return result;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new AppError("Already liked this post", 409);
        }
        throw error;
    }
};

export const unlikePost = async (userId: string, postId: string) => {
    try {
        return await postRepo.unlike(userId, postId);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new AppError("You have not liked this post", 404);
        }
        throw error;
    }
};

// ─── Bookmark / Unbookmark ─────────────────────────────────

export const bookmarkPost = async (userId: string, postId: string) => {
    const post = await postRepo.findById(postId);
    if (!post) {
        throw new AppError("Post not found", 404);
    }

    try {
        return await postRepo.bookmark(userId, postId);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new AppError("Already bookmarked this post", 409);
        }
        throw error;
    }
};

export const unbookmarkPost = async (userId: string, postId: string) => {
    try {
        return await postRepo.unbookmark(userId, postId);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new AppError("You have not bookmarked this post", 404);
        }
        throw error;
    }
};

// ─── Repost / Unrepost ─────────────────────────────────────

export const repostPost = async (userId: string, postId: string) => {
    const post = await postRepo.findById(postId);
    if (!post) {
        throw new AppError("Post not found", 404);
    }

    if (post.authorId === userId) {
        throw new AppError("You cannot repost your own post", 400);
    }

    try {
        const result = await postRepo.repost(userId, postId);
        notificationService.createNotification({
            userId: post.authorId,
            actorId: userId,
            type: "REPOST",
            message: "reposted your post",
            referenceId: postId,
            referenceType: "POST",
        });
        return result;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new AppError("Already reposted this post", 409);
        }
        throw error;
    }
};

export const unrepostPost = async (userId: string, postId: string) => {
    try {
        return await postRepo.unrepost(userId, postId);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new AppError("You have not reposted this post", 404);
        }
        throw error;
    }
};
