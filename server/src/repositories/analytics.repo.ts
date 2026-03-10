import { prisma } from "../lib/prisma.js";

// ─── Analytics Repository ─────────────────────────────────
// Aggregation queries for creator and admin analytics.

// ─── Creator: Post Performance ────────────────────────────

export const getCreatorPostPerformance = async (userId: string) => {
    const posts = await prisma.post.findMany({
        where: { authorId: userId, status: "PUBLISHED" },
        select: {
            id: true,
            title: true,
            createdAt: true,
            _count: {
                select: {
                    likes: true,
                    comments: true,
                    reposts: true,
                    bookmarks: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
    });

    return posts;
};

// ─── Creator: Overall Stats ───────────────────────────────

export const getCreatorStats = async (userId: string) => {
    const [postCount, totalLikes, totalComments, totalReposts, followerCount] =
        await Promise.all([
            prisma.post.count({
                where: { authorId: userId, status: "PUBLISHED" },
            }),
            prisma.like.count({
                where: { post: { authorId: userId } },
            }),
            prisma.comment.count({
                where: { post: { authorId: userId } },
            }),
            prisma.repost.count({
                where: { post: { authorId: userId } },
            }),
            prisma.follow.count({
                where: { followingId: userId },
            }),
        ]);

    const totalInteractions = totalLikes + totalComments + totalReposts;
    const engagementRate =
        followerCount > 0
            ? parseFloat(((totalInteractions / followerCount) * 100).toFixed(2))
            : 0;

    return {
        postCount,
        totalLikes,
        totalComments,
        totalReposts,
        followerCount,
        engagementRate,
    };
};

// ─── Creator: Follower Growth (last N days) ───────────────

export const getFollowerGrowth = async (userId: string, days: number = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const follows = await prisma.follow.findMany({
        where: {
            followingId: userId,
            createdAt: { gte: startDate },
        },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
    });

    // Group by day
    const grouped: Record<string, number> = {};
    for (const follow of follows) {
        const dateKey = follow.createdAt.toISOString().split("T")[0];
        grouped[dateKey] = (grouped[dateKey] || 0) + 1;
    }

    // Fill in missing days with 0
    const result: Array<{ date: string; count: number }> = [];
    const current = new Date(startDate);
    const today = new Date();
    while (current <= today) {
        const dateKey = current.toISOString().split("T")[0];
        result.push({ date: dateKey, count: grouped[dateKey] || 0 });
        current.setDate(current.getDate() + 1);
    }

    return result;
};

// ─── Admin: Platform Stats ────────────────────────────────

export const getAdminPlatformStats = async () => {
    const [
        totalUsers,
        activeUsers,
        totalPosts,
        flaggedPosts,
        totalReports,
        pendingReports,
        moderationActions,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
            where: { accountStatus: "ACTIVE" },
        }),
        prisma.post.count(),
        prisma.post.count({
            where: { status: "PUBLISHED" },
        }),
        prisma.report.count(),
        prisma.report.count({
            where: { status: "PENDING" },
        }),
        prisma.moderationAction.count(),
    ]);

    // Flagged ratio — posts that have at least one report
    const postsWithReports = await prisma.report.findMany({
        where: { targetType: "POST" },
        select: { targetId: true },
        distinct: ["targetId"],
    });

    const flaggedRatio =
        totalPosts > 0
            ? parseFloat(
                ((postsWithReports.length / totalPosts) * 100).toFixed(2)
            )
            : 0;

    return {
        totalUsers,
        activeUsers,
        totalPosts,
        flaggedPostCount: postsWithReports.length,
        flaggedRatio,
        totalReports,
        pendingReports,
        moderationActions,
    };
};

// ─── Admin: User Growth (last N days) ─────────────────────

export const getUserGrowth = async (days: number = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const users = await prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
    });

    const grouped: Record<string, number> = {};
    for (const user of users) {
        const dateKey = user.createdAt.toISOString().split("T")[0];
        grouped[dateKey] = (grouped[dateKey] || 0) + 1;
    }

    const result: Array<{ date: string; count: number }> = [];
    const current = new Date(startDate);
    const today = new Date();
    while (current <= today) {
        const dateKey = current.toISOString().split("T")[0];
        result.push({ date: dateKey, count: grouped[dateKey] || 0 });
        current.setDate(current.getDate() + 1);
    }

    return result;
};

// ─── Admin: Content Growth (last N days) ──────────────────

export const getContentGrowth = async (days: number = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const posts = await prisma.post.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
    });

    const grouped: Record<string, number> = {};
    for (const post of posts) {
        const dateKey = post.createdAt.toISOString().split("T")[0];
        grouped[dateKey] = (grouped[dateKey] || 0) + 1;
    }

    const result: Array<{ date: string; count: number }> = [];
    const current = new Date(startDate);
    const today = new Date();
    while (current <= today) {
        const dateKey = current.toISOString().split("T")[0];
        result.push({ date: dateKey, count: grouped[dateKey] || 0 });
        current.setDate(current.getDate() + 1);
    }

    return result;
};

// ─── Admin: Trending Communities ──────────────────────────

export const getTrendingCommunities = async (limit: number = 5) => {
    const communities = await prisma.community.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
            _count: {
                select: {
                    posts: true,
                    members: true,
                },
            },
        },
        orderBy: { posts: { _count: "desc" } },
        take: limit,
    });

    return communities;
};
