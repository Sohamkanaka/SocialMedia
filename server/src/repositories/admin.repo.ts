import { prisma } from "../lib/prisma.js";
import type { Role } from "@prisma/client";

// ─── Admin Repository ─────────────────────────────────────
// User management and system settings CRUD.

// ─── Paginated User List ──────────────────────────────────

export const getUsers = async (
    page: number = 1,
    limit: number = 20,
    filters: {
        search?: string;
        role?: string;
        accountStatus?: string;
    } = {}
) => {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (filters.search) {
        where.OR = [
            { displayName: { contains: filters.search, mode: "insensitive" } },
            { email: { contains: filters.search, mode: "insensitive" } },
        ];
    }

    if (filters.role) {
        where.role = filters.role;
    }

    if (filters.accountStatus) {
        where.accountStatus = filters.accountStatus;
    }

    const [items, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                displayName: true,
                role: true,
                avatar: true,
                accountStatus: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: true,
                        followers: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
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

// ─── Update User Role ─────────────────────────────────────

export const updateUserRole = async (userId: string, role: Role) => {
    return prisma.user.update({
        where: { id: userId },
        data: { role },
        select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
            accountStatus: true,
        },
    });
};

// ─── Find User by ID ──────────────────────────────────────

export const findUserById = async (userId: string) => {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
            accountStatus: true,
        },
    });
};

// ─── Get All System Settings ──────────────────────────────

export const getSettings = async () => {
    return prisma.systemSetting.findMany({
        orderBy: { category: "asc" },
    });
};

// ─── Upsert System Setting ───────────────────────────────

export const upsertSetting = async (
    key: string,
    value: string,
    label?: string,
    category?: string
) => {
    return prisma.systemSetting.upsert({
        where: { key },
        update: { value, ...(label && { label }), ...(category && { category }) },
        create: { key, value, label: label || key, category: category || "general" },
    });
};
