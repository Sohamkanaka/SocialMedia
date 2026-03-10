import { prisma } from "../lib/prisma.js";
import type { ModerationActionType } from "@prisma/client";
import { postInclude } from "./shared.js";

// ─── Moderation Repository ────────────────────────────────
// All direct Prisma calls for moderation live here.

// ─── Find Flagged Posts (posts with pending reports) ───────

export const findFlaggedPosts = async (
    page: number = 1,
    limit: number = 20,
    filters?: {
        status?: string;
        communityId?: string;
    }
) => {
    // Find posts that have pending/reviewed reports
    const reportedPostIds = await prisma.report.findMany({
        where: {
            targetType: "POST",
            status: { in: ["PENDING", "REVIEWED"] },
        },
        select: { targetId: true },
        distinct: ["targetId"],
    });

    const postIds = reportedPostIds.map((r) => r.targetId);

    if (postIds.length === 0) {
        return { items: [], total: 0, page, limit, totalPages: 0 };
    }

    const where = {
        id: { in: postIds },
        ...(filters?.communityId && { communityId: filters.communityId }),
    };

    const [posts, total] = await Promise.all([
        prisma.post.findMany({
            where,
            include: {
                ...postInclude,
                _count: {
                    select: {
                        comments: true,
                        likes: true,
                        bookmarks: true,
                        reposts: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.post.count({ where }),
    ]);

    // Enrich posts with report count and risk scoring info
    const enrichedPosts = await Promise.all(
        posts.map(async (post) => {
            const reportCount = await prisma.report.count({
                where: { targetType: "POST", targetId: post.id },
            });

            const reports = await prisma.report.findMany({
                where: { targetType: "POST", targetId: post.id },
                select: { reason: true },
            });

            const categories = [...new Set(reports.map((r) => r.reason))];

            return {
                ...post,
                reportCount,
                categories,
            };
        })
    );

    return {
        items: enrichedPosts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};

// ─── Create Moderation Action (Audit Log) ──────────────────

export const createAction = async (data: {
    actionType: string;
    targetUserId?: string;
    postId?: string;
    reason?: string;
    performedBy: string;
}) => {
    return prisma.moderationAction.create({
        data: {
            actionType: data.actionType as ModerationActionType,
            targetUserId: data.targetUserId,
            postId: data.postId,
            reason: data.reason,
            performedBy: data.performedBy,
        },
        include: {
            targetUser: {
                select: { id: true, displayName: true, avatar: true },
            },
            performer: {
                select: { id: true, displayName: true, avatar: true },
            },
        },
    });
};

// ─── Find Moderation Actions (Audit History) ───────────────

export const findActions = async (
    page: number = 1,
    limit: number = 20,
    filters?: {
        targetUserId?: string;
        performedBy?: string;
        actionType?: string;
    }
) => {
    const where = {
        ...(filters?.targetUserId && { targetUserId: filters.targetUserId }),
        ...(filters?.performedBy && { performedBy: filters.performedBy }),
        ...(filters?.actionType && {
            actionType: filters.actionType as ModerationActionType,
        }),
    };

    const [items, total] = await Promise.all([
        prisma.moderationAction.findMany({
            where,
            include: {
                targetUser: {
                    select: { id: true, displayName: true, avatar: true },
                },
                performer: {
                    select: { id: true, displayName: true, avatar: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.moderationAction.count({ where }),
    ]);

    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};
