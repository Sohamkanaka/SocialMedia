import { AppError } from "../middleware/errorHandler.js";
import * as moderationRepo from "../repositories/moderation.repo.js";
import * as reportRepo from "../repositories/report.repo.js";
import * as riskScoringService from "./risk-scoring.service.js";
import { prisma } from "../lib/prisma.js";

// ─── Moderation Service ───────────────────────────────────
// Business logic only — no HTTP concerns, no direct DB calls.

// ─── Get Moderation Queue ──────────────────────────────────

export const getModerationQueue = async (
    page: number = 1,
    limit: number = 20,
    filters?: {
        status?: string;
        communityId?: string;
    }
) => {
    const result = await moderationRepo.findFlaggedPosts(page, limit, filters);

    // Enrich with risk scores
    const itemsWithScores = result.items.map((post) => {
        const content = `${post.title || ""} ${post.content || ""}`;
        const riskScore = riskScoringService.calculateRiskScore(
            content,
            post.reportCount
        );

        return {
            ...post,
            riskScore,
            isFlagged: riskScoringService.shouldAutoFlag(riskScore),
        };
    });

    // Sort by risk score (highest first)
    itemsWithScores.sort((a, b) => b.riskScore - a.riskScore);

    return {
        ...result,
        items: itemsWithScores,
    };
};

// ─── Approve Post ──────────────────────────────────────────

export const approvePost = async (postId: string, moderatorId: string, reason?: string) => {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
        throw new AppError("Post not found", 404);
    }

    // Resolve all related reports
    await reportRepo.resolveAllForTarget("POST", postId, moderatorId);

    // Log the action
    await moderationRepo.createAction({
        actionType: "APPROVE",
        postId,
        reason,
        performedBy: moderatorId,
    });

    return { message: "Post approved and reports resolved" };
};

// ─── Remove Post ───────────────────────────────────────────

export const removePost = async (postId: string, moderatorId: string, reason?: string) => {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
        throw new AppError("Post not found", 404);
    }

    // Archive the post
    await prisma.post.update({
        where: { id: postId },
        data: { status: "ARCHIVED" },
    });

    // Resolve all related reports
    await reportRepo.resolveAllForTarget("POST", postId, moderatorId);

    // Log the action
    await moderationRepo.createAction({
        actionType: "REMOVE",
        postId,
        targetUserId: post.authorId,
        reason,
        performedBy: moderatorId,
    });

    return { message: "Post removed and reports resolved" };
};

// ─── Warn User (from post context) ─────────────────────────

export const warnUser = async (postId: string, moderatorId: string, reason?: string) => {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
        throw new AppError("Post not found", 404);
    }

    // Update user status to WARNING
    await prisma.user.update({
        where: { id: post.authorId },
        data: { accountStatus: "WARNING" },
    });

    // Log the action
    await moderationRepo.createAction({
        actionType: "WARN_USER",
        postId,
        targetUserId: post.authorId,
        reason,
        performedBy: moderatorId,
    });

    return { message: "User warned successfully" };
};

// ─── Escalate Post ─────────────────────────────────────────

export const escalatePost = async (postId: string, moderatorId: string, reason?: string) => {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
        throw new AppError("Post not found", 404);
    }

    // Update all reports for this post to REVIEWED
    await prisma.report.updateMany({
        where: {
            targetType: "POST",
            targetId: postId,
            status: "PENDING",
        },
        data: { status: "REVIEWED" },
    });

    // Log the action
    await moderationRepo.createAction({
        actionType: "ESCALATE",
        postId,
        targetUserId: post.authorId,
        reason,
        performedBy: moderatorId,
    });

    return { message: "Post escalated to admin" };
};

// ─── Get Audit History ─────────────────────────────────────

export const getAuditHistory = async (
    page: number = 1,
    limit: number = 20,
    filters?: {
        targetUserId?: string;
        performedBy?: string;
        actionType?: string;
    }
) => {
    return moderationRepo.findActions(page, limit, filters);
};
