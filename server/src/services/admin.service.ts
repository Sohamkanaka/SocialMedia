import * as adminRepo from "../repositories/admin.repo.js";
import * as complianceRepo from "../repositories/compliance.repo.js";
import { AppError } from "../middleware/errorHandler.js";
import type { Role } from "@prisma/client";

// ─── Admin Service ────────────────────────────────────────

// ─── Get Users (paginated) ────────────────────────────────

export const getUsers = async (
    page: number = 1,
    limit: number = 20,
    filters: {
        search?: string;
        role?: string;
        accountStatus?: string;
    } = {}
) => {
    return adminRepo.getUsers(page, limit, filters);
};

// ─── Update User Role ─────────────────────────────────────

export const updateUserRole = async (
    targetUserId: string,
    role: Role,
    performedByUserId: string
) => {
    const user = await adminRepo.findUserById(targetUserId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    if (user.id === performedByUserId) {
        throw new AppError("Cannot change your own role", 400);
    }

    const previousRole = user.role;
    const updatedUser = await adminRepo.updateUserRole(targetUserId, role);

    // Audit log
    await complianceRepo.createAuditLog({
        userId: performedByUserId,
        action: "USER_ROLE_CHANGED",
        entityType: "User",
        entityId: targetUserId,
        metadata: JSON.stringify({ previousRole, newRole: role }),
    });

    return updatedUser;
};

// ─── Get System Settings ──────────────────────────────────

export const getSettings = async () => {
    const settings = await adminRepo.getSettings();

    // Convert to key-value map grouped by category
    const grouped: Record<
        string,
        Array<{ key: string; value: string; label: string | null }>
    > = {};
    for (const setting of settings) {
        if (!grouped[setting.category]) {
            grouped[setting.category] = [];
        }
        grouped[setting.category].push({
            key: setting.key,
            value: setting.value,
            label: setting.label,
        });
    }

    return { settings, grouped };
};

// ─── Update System Settings ──────────────────────────────

export const updateSettings = async (
    settingsToUpdate: Array<{
        key: string;
        value: string;
        label?: string;
        category?: string;
    }>,
    performedByUserId: string
) => {
    const results = [];

    for (const setting of settingsToUpdate) {
        const result = await adminRepo.upsertSetting(
            setting.key,
            setting.value,
            setting.label,
            setting.category
        );
        results.push(result);
    }

    // Audit log
    await complianceRepo.createAuditLog({
        userId: performedByUserId,
        action: "SYSTEM_SETTINGS_UPDATED",
        entityType: "SystemSetting",
        metadata: JSON.stringify({
            updatedKeys: settingsToUpdate.map((s) => s.key),
        }),
    });

    return results;
};
