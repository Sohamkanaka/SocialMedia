import { prisma } from "../lib/prisma.js";
import type { NotificationType } from "@prisma/client/index";
import { actorSelect } from "./shared.js";

// ─── Notification Repository ──────────────────────────────
// All direct Prisma calls for notifications live here.

// ─── Create Notification ───────────────────────────────────

export const create = async (data: {
    userId: string;
    actorId: string;
    type: string;
    message: string;
    referenceId?: string;
    referenceType?: string;
}) => {
    return prisma.notification.create({
        data: {
            ...data,
            type: data.type as NotificationType,
        },
    });
};

// ─── Find Notifications by User (paginated) ────────────────

export const findByUserId = async (
    userId: string,
    cursor?: string,
    limit: number = 20
) => {
    const notifications = await prisma.notification.findMany({
        where: { userId },
        include: {
            actor: { select: actorSelect },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
        }),
    });

    const hasMore = notifications.length > limit;
    const items = hasMore ? notifications.slice(0, limit) : notifications;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
};

// ─── Mark as Read ──────────────────────────────────────────

export const markAsRead = async (id: string) => {
    return prisma.notification.update({
        where: { id },
        data: { isRead: true },
    });
};

// ─── Mark All as Read ──────────────────────────────────────

export const markAllAsRead = async (userId: string) => {
    return prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
    });
};

// ─── Get Unread Count ──────────────────────────────────────

export const getUnreadCount = async (userId: string) => {
    return prisma.notification.count({
        where: { userId, isRead: false },
    });
};

// ─── Find by ID ────────────────────────────────────────────

export const findById = async (id: string) => {
    return prisma.notification.findUnique({
        where: { id },
    });
};
