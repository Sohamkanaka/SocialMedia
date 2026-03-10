import { prisma } from "../lib/prisma.js";
import { authorSelect } from "./shared.js";

// ─── Comment Repository ───────────────────────────────────
// All direct Prisma calls for comments live here.

// ─── Create Comment ────────────────────────────────────────

export const create = async (data: {
    content: string;
    authorId: string;
    postId: string;
    parentId?: string;
}) => {
    return prisma.comment.create({
        data,
        include: {
            author: { select: authorSelect },
        },
    });
};

// ─── Find Comments by Post ID (paginated, top-level) ──────

export const findByPostId = async (
    postId: string,
    cursor?: string,
    limit: number = 20
) => {
    const comments = await prisma.comment.findMany({
        where: {
            postId,
            parentId: null, // top-level only
        },
        include: {
            author: { select: authorSelect },
            children: {
                include: {
                    author: { select: authorSelect },
                },
                orderBy: { createdAt: "asc" },
            },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
        }),
    });

    const hasMore = comments.length > limit;
    const items = hasMore ? comments.slice(0, limit) : comments;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
};

// ─── Find by ID ────────────────────────────────────────────

export const findById = async (id: string) => {
    return prisma.comment.findUnique({
        where: { id },
        include: {
            author: { select: authorSelect },
        },
    });
};
