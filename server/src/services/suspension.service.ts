import { AppError } from "../middleware/errorHandler.js";
import * as suspensionRepo from "../repositories/suspension.repo.js";
import * as moderationRepo from "../repositories/moderation.repo.js";

// ─── Suspension Service ───────────────────────────────────
// Business logic only — no HTTP concerns, no direct DB calls.

// ─── Valid Status Transitions ──────────────────────────────

const VALID_TRANSITIONS: Record<string, string[]> = {
    ACTIVE: ["WARNING"],
    WARNING: ["TEMP_SUSPENDED", "PERMANENTLY_BANNED", "ACTIVE"],
    TEMP_SUSPENDED: ["PERMANENTLY_BANNED", "APPEAL", "ACTIVE"],
    PERMANENTLY_BANNED: ["APPEAL"],
    APPEAL: ["REINSTATED", "PERMANENTLY_BANNED", "TEMP_SUSPENDED"],
    REINSTATED: ["ACTIVE", "WARNING"],
};

// ─── Warn User ─────────────────────────────────────────────

export const warnUser = async (
    targetUserId: string,
    moderatorId: string,
    reason: string
) => {
    const user = await validateTransition(targetUserId, "WARNING");

    const updatedUser = await suspensionRepo.updateAccountStatus(
        targetUserId,
        "WARNING",
        { suspensionReason: reason }
    );

    await moderationRepo.createAction({
        actionType: "WARN_USER",
        targetUserId,
        reason,
        performedBy: moderatorId,
    });

    return updatedUser;
};

// ─── Suspend User ──────────────────────────────────────────

export const suspendUser = async (
    targetUserId: string,
    adminId: string,
    data: { type: string; reason: string; duration?: number }
) => {
    const targetStatus =
        data.type === "PERMANENT" ? "PERMANENTLY_BANNED" : "TEMP_SUSPENDED";

    await validateTransition(targetUserId, targetStatus);

    const suspendedUntil =
        data.type === "TEMP" && data.duration
            ? new Date(Date.now() + data.duration * 24 * 60 * 60 * 1000)
            : undefined;

    const updatedUser = await suspensionRepo.updateAccountStatus(
        targetUserId,
        targetStatus,
        {
            suspendedUntil,
            suspensionReason: data.reason,
        }
    );

    await moderationRepo.createAction({
        actionType: "SUSPEND",
        targetUserId,
        reason: `${data.type} suspension: ${data.reason}`,
        performedBy: adminId,
    });

    return updatedUser;
};

// ─── Submit Appeal ─────────────────────────────────────────

export const submitAppeal = async (userId: string, reason: string) => {
    await validateTransition(userId, "APPEAL");

    const updatedUser = await suspensionRepo.updateAccountStatus(
        userId,
        "APPEAL",
        { suspensionReason: reason }
    );

    return updatedUser;
};

// ─── Reinstate User ────────────────────────────────────────

export const reinstateUser = async (
    targetUserId: string,
    adminId: string,
    reason?: string
) => {
    await validateTransition(targetUserId, "REINSTATED");

    // First set to REINSTATED, then to ACTIVE
    await suspensionRepo.updateAccountStatus(targetUserId, "REINSTATED");

    const updatedUser = await suspensionRepo.updateAccountStatus(
        targetUserId,
        "ACTIVE"
    );

    await moderationRepo.createAction({
        actionType: "REINSTATE",
        targetUserId,
        reason,
        performedBy: adminId,
    });

    return updatedUser;
};

// ─── Get Suspended Users ───────────────────────────────────

export const getSuspendedUsers = async (page: number, limit: number) => {
    return suspensionRepo.findSuspendedUsers(page, limit);
};

// ─── Get Appeals ───────────────────────────────────────────

export const getAppeals = async (page: number, limit: number) => {
    return suspensionRepo.findAppeals(page, limit);
};

// ─── Get Repeat Offenders ──────────────────────────────────

export const getRepeatOffenders = async (page: number, limit: number) => {
    return suspensionRepo.findRepeatOffenders(page, limit);
};

// ─── Helper: Validate Status Transition ────────────────────

const validateTransition = async (userId: string, targetStatus: string) => {
    const { prisma } = await import("../lib/prisma.js");

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, accountStatus: true },
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const allowed = VALID_TRANSITIONS[user.accountStatus] || [];
    if (!allowed.includes(targetStatus)) {
        throw new AppError(
            `Cannot transition from ${user.accountStatus} to ${targetStatus}`,
            400
        );
    }

    return user;
};
