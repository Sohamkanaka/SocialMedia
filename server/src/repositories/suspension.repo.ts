import { prisma } from "../lib/prisma.js";
import type { AccountStatus } from "@prisma/client/index";

// ─── Suspension Repository ────────────────────────────────
// All direct Prisma calls for account suspension live here.

// ─── Update Account Status ─────────────────────────────────

export const updateAccountStatus = async (
    userId: string,
    status: string,
    data?: {
        suspendedUntil?: Date;
        suspensionReason?: string;
    }
) => {
    return prisma.user.update({
        where: { id: userId },
        data: {
            accountStatus: status as AccountStatus,
            suspendedUntil: data?.suspendedUntil || null,
            suspensionReason: data?.suspensionReason || null,
        },
        select: {
            id: true,
            displayName: true,
            email: true,
            avatar: true,
            role: true,
            accountStatus: true,
            suspendedUntil: true,
            suspensionReason: true,
        },
    });
};

// ─── Find Suspended Users ──────────────────────────────────

export const findSuspendedUsers = async (
    page: number = 1,
    limit: number = 20
) => {
    const where = {
        accountStatus: {
            in: ["TEMP_SUSPENDED", "PERMANENTLY_BANNED"] as AccountStatus[],
        },
    };

    const [items, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                displayName: true,
                email: true,
                avatar: true,
                role: true,
                accountStatus: true,
                suspendedUntil: true,
                suspensionReason: true,
                createdAt: true,
            },
            orderBy: { updatedAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.user.count({ where }),
    ]);

    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};

// ─── Find Appeals ──────────────────────────────────────────

export const findAppeals = async (page: number = 1, limit: number = 20) => {
    const where = { accountStatus: "APPEAL" as AccountStatus };

    const [items, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                displayName: true,
                email: true,
                avatar: true,
                role: true,
                accountStatus: true,
                suspendedUntil: true,
                suspensionReason: true,
                createdAt: true,
            },
            orderBy: { updatedAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.user.count({ where }),
    ]);

    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};

// ─── Find Repeat Offenders ─────────────────────────────────

export const findRepeatOffenders = async (
    page: number = 1,
    limit: number = 20
) => {
    // Users with multiple moderation actions against them
    const offenders = await prisma.moderationAction.groupBy({
        by: ["targetUserId"],
        where: {
            targetUserId: { not: null },
            actionType: { in: ["WARN_USER", "REMOVE", "SUSPEND"] },
        },
        _count: { id: true },
        having: {
            id: { _count: { gt: 1 } },
        },
        orderBy: { _count: { id: "desc" } },
        skip: (page - 1) * limit,
        take: limit,
    });

    const userIds = offenders
        .map((o) => o.targetUserId)
        .filter((id): id is string => id !== null);

    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
            id: true,
            displayName: true,
            email: true,
            avatar: true,
            role: true,
            accountStatus: true,
            suspendedUntil: true,
            suspensionReason: true,
            createdAt: true,
        },
    });

    // Map users with their action counts
    const items = offenders.map((o) => {
        const user = users.find((u) => u.id === o.targetUserId);
        return {
            ...user,
            actionCount: o._count.id,
        };
    });

    return {
        items,
        total: offenders.length,
        page,
        limit,
        totalPages: Math.ceil(offenders.length / limit),
    };
};
