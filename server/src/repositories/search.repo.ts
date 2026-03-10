import { prisma } from "../lib/prisma.js";
import { attachFollowingStatus } from "./user.repo.js";

// ─── Search Repository ────────────────────────────────────
// All direct Prisma calls for search live here.

// ─── Search Posts ──────────────────────────────────────────

export const searchPosts = async (
    query: string,
    limit: number = 20,
    communityId?: string
) => {
    return prisma.post.findMany({
        where: {
            status: "PUBLISHED",
            ...(communityId && { communityId }),
            OR: [
                { title: { contains: query, mode: "insensitive" } },
                { content: { contains: query, mode: "insensitive" } },
            ],
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
        take: limit,
    });
};

// ─── Search Users ──────────────────────────────────────────

export const searchUsers = async (
    query: string,
    viewerId?: string,
    limit: number = 20
) => {
    const users = await prisma.user.findMany({
        where: {
            displayName: { contains: query, mode: "insensitive" },
        },
        select: {
            id: true,
            displayName: true,
            avatar: true,
            bio: true,
            role: true,
            _count: {
                select: { followers: true, following: true, posts: true },
            },
        },
        take: limit,
    });

    return attachFollowingStatus(viewerId, users);
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
            _count: {
                select: { members: true, posts: true },
            },
        },
        take: limit,
        orderBy: { createdAt: "desc" },
    });
};

// ─── Trending Hashtags (simple keyword frequency) ──────────

export const getTrendingHashtags = async (limit: number = 10) => {
    // Get recent posts (last 7 days) and extract hashtag-like words
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentPosts = await prisma.post.findMany({
        where: {
            status: "PUBLISHED",
            createdAt: { gte: sevenDaysAgo },
        },
        select: { title: true, content: true },
        orderBy: { createdAt: "desc" },
        take: 500,
    });

    // Extract hashtags from title and content
    const hashtagCounts: Record<string, number> = {};
    const hashtagRegex = /#(\w{2,30})/g;

    for (const post of recentPosts) {
        const text = `${post.title} ${post.content || ""}`;
        let match;
        while ((match = hashtagRegex.exec(text)) !== null) {
            const tag = match[1].toLowerCase();
            hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
        }
    }

    // Sort by frequency and return top N
    return Object.entries(hashtagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([tag, count]) => ({ tag, count }));
};

// ─── Suggested Users ───────────────────────────────────────

export const getSuggestedUsers = async (userId: string, limit: number = 10) => {
    // Get users the current user doesn't follow
    const following = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);
    followingIds.push(userId); // Exclude self

    const users = await prisma.user.findMany({
        where: {
            id: { notIn: followingIds },
        },
        select: {
            id: true,
            displayName: true,
            avatar: true,
            bio: true,
            _count: {
                select: { followers: true, posts: true },
            },
        },
        orderBy: { followers: { _count: "desc" } },
        take: limit,
    });

    return attachFollowingStatus(userId, users);
};
