import { prisma } from "../lib/prisma.js";
import type { ReportReason, ReportStatus, ReportTargetType } from "@prisma/client/index";

// ─── Report Repository ────────────────────────────────────
// All direct Prisma calls for reports live here.

// ─── Create ────────────────────────────────────────────────

export const create = async (data: {
    reporterId: string;
    targetType: string;
    targetId: string;
    reason: string;
}) => {
    return prisma.report.create({
        data: {
            reporterId: data.reporterId,
            targetType: data.targetType as ReportTargetType,
            targetId: data.targetId,
            reason: data.reason as ReportReason,
        },
        include: {
            reporter: {
                select: { id: true, displayName: true, avatar: true },
            },
        },
    });
};

// ─── Find By ID ────────────────────────────────────────────

export const findById = async (id: string) => {
    return prisma.report.findUnique({
        where: { id },
        include: {
            reporter: {
                select: { id: true, displayName: true, avatar: true },
            },
            resolver: {
                select: { id: true, displayName: true, avatar: true },
            },
        },
    });
};

// ─── Find All (with filters and pagination) ────────────────

export const findAll = async (filters: {
    status?: string;
    reason?: string;
    targetType?: string;
    page: number;
    limit: number;
}) => {
    const where = {
        ...(filters.status && { status: filters.status as ReportStatus }),
        ...(filters.reason && { reason: filters.reason as ReportReason }),
        ...(filters.targetType && { targetType: filters.targetType as ReportTargetType }),
    };

    const [items, total] = await Promise.all([
        prisma.report.findMany({
            where,
            include: {
                reporter: {
                    select: { id: true, displayName: true, avatar: true },
                },
                resolver: {
                    select: { id: true, displayName: true, avatar: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip: (filters.page - 1) * filters.limit,
            take: filters.limit,
        }),
        prisma.report.count({ where }),
    ]);

    return {
        items,
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
    };
};

// ─── Update Status ─────────────────────────────────────────

export const updateStatus = async (
    id: string,
    status: string,
    resolvedBy?: string
) => {
    return prisma.report.update({
        where: { id },
        data: {
            status: status as ReportStatus,
            ...(status === "RESOLVED" && resolvedBy && {
                resolvedBy,
                resolvedAt: new Date(),
            }),
        },
        include: {
            reporter: {
                select: { id: true, displayName: true, avatar: true },
            },
            resolver: {
                select: { id: true, displayName: true, avatar: true },
            },
        },
    });
};

// ─── Count Reports for a Target ────────────────────────────

export const countByTarget = async (targetType: string, targetId: string) => {
    return prisma.report.count({
        where: {
            targetType: targetType as ReportTargetType,
            targetId,
        },
    });
};

// ─── Find Duplicate Report ─────────────────────────────────

export const findByReporterAndTarget = async (
    reporterId: string,
    targetType: string,
    targetId: string
) => {
    return prisma.report.findFirst({
        where: {
            reporterId,
            targetType: targetType as ReportTargetType,
            targetId,
        },
    });
};

// ─── Resolve All Reports for a Target ──────────────────────

export const resolveAllForTarget = async (
    targetType: string,
    targetId: string,
    resolvedBy: string
) => {
    return prisma.report.updateMany({
        where: {
            targetType: targetType as ReportTargetType,
            targetId,
            status: { not: "RESOLVED" },
        },
        data: {
            status: "RESOLVED",
            resolvedBy,
            resolvedAt: new Date(),
        },
    });
};
