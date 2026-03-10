import { prisma } from "../lib/prisma.js";
import type { CommunityMemberRole } from "@prisma/client/index";

// ─── Community Repository ─────────────────────────────────
// All direct Prisma calls for communities live here.

const memberCountSelect = {
    _count: {
        select: { members: true, posts: true },
    },
};

// ─── Create Community ──────────────────────────────────────

export const create = async (data: {
    name: string;
    slug: string;
    description?: string;
    creatorId: string;
}) => {
    return prisma.community.create({
        data: {
            ...data,
            members: {
                create: {
                    userId: data.creatorId,
                    role: "MODERATOR",
                },
            },
        },
        include: {
            creator: {
                select: { id: true, displayName: true, avatar: true },
            },
            ...memberCountSelect,
        },
    });
};

// ─── Find All (paginated) ──────────────────────────────────

export const findAll = async (cursor?: string, limit: number = 20) => {
    const communities = await prisma.community.findMany({
        include: {
            creator: {
                select: { id: true, displayName: true, avatar: true },
            },
            ...memberCountSelect,
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
        }),
    });

    const hasMore = communities.length > limit;
    const items = hasMore ? communities.slice(0, limit) : communities;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
};

// ─── Find by ID ────────────────────────────────────────────

export const findById = async (id: string) => {
    return prisma.community.findUnique({
        where: { id },
        include: {
            creator: {
                select: { id: true, displayName: true, avatar: true },
            },
            ...memberCountSelect,
        },
    });
};

// ─── Find by Slug ──────────────────────────────────────────

export const findBySlug = async (slug: string) => {
    return prisma.community.findUnique({
        where: { slug },
    });
};

// ─── Find Community Posts (paginated) ──────────────────────

export const findCommunityPosts = async (
    communityId: string,
    cursor?: string,
    limit: number = 10
) => {
    const posts = await prisma.post.findMany({
        where: {
            communityId,
            status: "PUBLISHED",
        },
        include: {
            author: {
                select: { id: true, displayName: true, avatar: true, role: true },
            },
            community: { select: { id: true, name: true, slug: true } },
            pollOptions: {
                select: { id: true, text: true, votesCount: true },
                orderBy: { text: "asc" as const },
            },
            _count: {
                select: { comments: true, likes: true, bookmarks: true, reposts: true },
            },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
        }),
    });

    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
};

// ─── Membership ────────────────────────────────────────────

export const findMembership = async (userId: string, communityId: string) => {
    return prisma.communityMember.findUnique({
        where: { userId_communityId: { userId, communityId } },
    });
};

export const addMember = async (userId: string, communityId: string) => {
    return prisma.communityMember.create({
        data: { userId, communityId },
    });
};

export const removeMember = async (userId: string, communityId: string) => {
    return prisma.communityMember.delete({
        where: { userId_communityId: { userId, communityId } },
    });
};

export const findMembers = async (
    communityId: string,
    cursor?: string,
    limit: number = 20
) => {
    const members = await prisma.communityMember.findMany({
        where: { communityId },
        include: {
            user: {
                select: { id: true, displayName: true, avatar: true, bio: true, role: true },
            },
        },
        orderBy: { joinedAt: "desc" },
        take: limit + 1,
        ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
        }),
    });

    const hasMore = members.length > limit;
    const items = hasMore ? members.slice(0, limit) : members;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
};

export const updateMemberRole = async (
    userId: string,
    communityId: string,
    role: CommunityMemberRole
) => {
    return prisma.communityMember.update({
        where: { userId_communityId: { userId, communityId } },
        data: { role },
    });
};

// ─── Search Communities ────────────────────────────────────

export const searchCommunities = async (query: string, limit: number = 20) => {
    return prisma.community.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
            ],
        },
        include: {
            creator: {
                select: { id: true, displayName: true, avatar: true },
            },
            ...memberCountSelect,
        },
        take: limit,
        orderBy: { createdAt: "desc" },
    });
};
