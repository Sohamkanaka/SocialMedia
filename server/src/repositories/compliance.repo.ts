import { prisma } from "../lib/prisma.js";
import type { DataExportFormat, DataExportStatus } from "@prisma/client";

// ─── Compliance Repository ────────────────────────────────
// Data export CRUD and audit log queries.

// ─── Create Data Export Record ────────────────────────────

export const createDataExport = async (
    userId: string,
    format: DataExportFormat
) => {
    return prisma.dataExport.create({
        data: { userId, format },
    });
};

// ─── Update Data Export ───────────────────────────────────

export const updateDataExport = async (
    id: string,
    data: {
        status?: DataExportStatus;
        filePath?: string;
        fileSize?: number;
        expiresAt?: Date;
        error?: string;
    }
) => {
    return prisma.dataExport.update({
        where: { id },
        data,
    });
};

// ─── Find Export by ID ────────────────────────────────────

export const findExportById = async (id: string) => {
    return prisma.dataExport.findUnique({
        where: { id },
    });
};

// ─── List User Exports (paginated) ───────────────────────

export const listExports = async (
    userId: string,
    page: number = 1,
    limit: number = 10
) => {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
        prisma.dataExport.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.dataExport.count({ where: { userId } }),
    ]);

    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};

// ─── Gather User Data for Export ──────────────────────────

export const gatherUserData = async (userId: string) => {
    const [user, posts, comments, likes, follows, bookmarks] =
        await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                    bio: true,
                    avatar: true,
                    role: true,
                    createdAt: true,
                },
            }),
            prisma.post.findMany({
                where: { authorId: userId },
                select: {
                    id: true,
                    title: true,
                    content: true,
                    type: true,
                    status: true,
                    createdAt: true,
                },
            }),
            prisma.comment.findMany({
                where: { authorId: userId },
                select: {
                    id: true,
                    content: true,
                    postId: true,
                    createdAt: true,
                },
            }),
            prisma.like.findMany({
                where: { userId },
                select: { id: true, postId: true, createdAt: true },
            }),
            prisma.follow.findMany({
                where: { followerId: userId },
                select: { followingId: true, createdAt: true },
            }),
            prisma.bookmark.findMany({
                where: { userId },
                select: { postId: true, createdAt: true },
            }),
        ]);

    return { profile: user, posts, comments, likes, follows, bookmarks };
};

// ─── Create Audit Log Entry ──────────────────────────────

export const createAuditLog = async (data: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: string;
    ipAddress?: string;
}) => {
    return prisma.auditLog.create({ data });
};

// ─── Get Audit Logs (paginated, filtered) ────────────────

export const getAuditLogs = async (
    page: number = 1,
    limit: number = 20,
    filters: {
        entityType?: string;
        action?: string;
        userId?: string;
        startDate?: string;
        endDate?: string;
    } = {}
) => {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;
    if (filters.startDate || filters.endDate) {
        where.createdAt = {
            ...(filters.startDate && { gte: new Date(filters.startDate) }),
            ...(filters.endDate && { lte: new Date(filters.endDate) }),
        };
    }

    const [items, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.auditLog.count({ where }),
    ]);

    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};
