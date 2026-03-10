import { AppError } from "../middleware/errorHandler.js";
import * as userRepo from "../repositories/user.repo.js";
import * as postRepo from "../repositories/post.repo.js";
import * as notificationService from "./notification.service.js";
import { Prisma } from "@prisma/client/index";

// ─── User Service ─────────────────────────────────────────
// Business logic only — no HTTP concerns, no direct DB calls.

// ─── Get Profile ───────────────────────────────────────────

export const getProfile = async (userId: string, viewerId?: string) => {
    const user = await userRepo.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    let isFollowing = false;
    if (viewerId && viewerId !== userId) {
        const follow = await userRepo.findFollow(viewerId, userId);
        isFollowing = !!follow;
    }

    return { ...user, isFollowing };
};

// ─── Get User Posts ────────────────────────────────────────

export const getUserPosts = async (
    userId: string,
    viewerId: string | undefined,
    cursor?: string,
    limit?: number,
    statusFilter?: string
) => {
    // Other users can only see published posts
    // Owner can filter by any status, or see all if no filter
    const isOwner = viewerId === userId;
    const status = isOwner ? (statusFilter || undefined) : "PUBLISHED";
    return postRepo.findByUserId(userId, viewerId, cursor, limit, status);
};

// ─── Update Profile ────────────────────────────────────────

export const updateProfile = async (
    userId: string,
    data: { displayName?: string; bio?: string | null; avatar?: string | null }
) => {
    return userRepo.updateProfile(userId, data);
};

// ─── Follow User ───────────────────────────────────────────

export const followUser = async (followerId: string, followingId: string) => {
    if (followerId === followingId) {
        throw new AppError("You cannot follow yourself", 400);
    }

    const targetUser = await userRepo.findById(followingId);
    if (!targetUser) {
        throw new AppError("User not found", 404);
    }

    try {
        const result = await userRepo.follow(followerId, followingId);
        notificationService.createNotification({
            userId: followingId,
            actorId: followerId,
            type: "FOLLOW",
            message: "started following you",
            referenceId: followerId,
            referenceType: "USER",
        });
        return result;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new AppError("Already following this user", 409);
        }
        throw error;
    }
};

// ─── Unfollow User ─────────────────────────────────────────

export const unfollowUser = async (followerId: string, followingId: string) => {
    try {
        return await userRepo.unfollow(followerId, followingId);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new AppError("You are not following this user", 404);
        }
        throw error;
    }
};

// ─── Get Followers ─────────────────────────────────────────

export const getFollowers = async (
    userId: string,
    viewerId: string | undefined,
    cursor?: string,
    limit?: number
) => {
    return userRepo.getFollowers(userId, viewerId, cursor, limit);
};

// ─── Get Following ─────────────────────────────────────────

export const getFollowing = async (
    userId: string,
    viewerId: string | undefined,
    cursor?: string,
    limit?: number
) => {
    return userRepo.getFollowing(userId, viewerId, cursor, limit);
};

// ─── Get Bookmarks ─────────────────────────────────────────

export const getBookmarks = async (
    userId: string,
    cursor?: string,
    limit?: number
) => {
    return userRepo.getBookmarks(userId, cursor, limit);
};
