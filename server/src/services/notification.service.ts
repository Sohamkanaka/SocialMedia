import { AppError } from "../middleware/errorHandler.js";
import * as notificationRepo from "../repositories/notification.repo.js";

// ─── Notification Service ─────────────────────────────────
// Business logic only — no HTTP concerns, no direct DB calls.

// ─── Create Notification ───────────────────────────────────
// Used internally by other services (like, comment, follow, repost).
// Silently handles errors to not break the main action.

export const createNotification = async (data: {
    userId: string;
    actorId: string;
    type: string;
    message: string;
    referenceId?: string;
    referenceType?: string;
}) => {
    // Don't notify yourself
    if (data.userId === data.actorId) {
        return null;
    }

    try {
        return await notificationRepo.create(data);
    } catch (error) {
        // Log but don't throw — notifications should never break the main flow
        console.error("Failed to create notification:", error);
        return null;
    }
};

// ─── Get Notifications ─────────────────────────────────────

export const getNotifications = async (
    userId: string,
    cursor?: string,
    limit?: number
) => {
    return notificationRepo.findByUserId(userId, cursor, limit);
};

// ─── Mark as Read ──────────────────────────────────────────

export const markAsRead = async (id: string, userId: string) => {
    const notification = await notificationRepo.findById(id);
    if (!notification) {
        throw new AppError("Notification not found", 404);
    }

    if (notification.userId !== userId) {
        throw new AppError("You can only mark your own notifications as read", 403);
    }

    return notificationRepo.markAsRead(id);
};

// ─── Mark All as Read ──────────────────────────────────────

export const markAllAsRead = async (userId: string) => {
    return notificationRepo.markAllAsRead(userId);
};

// ─── Get Unread Count ──────────────────────────────────────

export const getUnreadCount = async (userId: string) => {
    return notificationRepo.getUnreadCount(userId);
};
