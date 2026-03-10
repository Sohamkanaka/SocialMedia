import { prisma } from "../lib/prisma.js";

// ─── Auth Repository ──────────────────────────────────────
// All direct Prisma calls live here. Services never touch Prisma.

export const createUser = async (data: {
    email: string;
    password: string;
    displayName: string;
}) => {
    return prisma.user.create({
        data,
        select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
            avatar: true,
            bio: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};

export const findByEmail = async (email: string) => {
    return prisma.user.findUnique({
        where: { email },
    });
};

export const findById = async (id: string) => {
    return prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
            avatar: true,
            bio: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};
