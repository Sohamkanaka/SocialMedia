import * as analyticsRepo from "../repositories/analytics.repo.js";

// ─── Analytics Service ────────────────────────────────────
// Business logic for analytics — orchestrates repo calls.

// ─── Creator Analytics ────────────────────────────────────

export const getCreatorAnalytics = async (
    userId: string,
    days: number = 30
) => {
    const [stats, postPerformance, followerGrowth] = await Promise.all([
        analyticsRepo.getCreatorStats(userId),
        analyticsRepo.getCreatorPostPerformance(userId),
        analyticsRepo.getFollowerGrowth(userId, days),
    ]);

    return {
        stats,
        postPerformance,
        followerGrowth,
    };
};

// ─── Admin Analytics ──────────────────────────────────────

export const getAdminAnalytics = async (days: number = 30) => {
    const [platformStats, userGrowth, contentGrowth, trendingCommunities] =
        await Promise.all([
            analyticsRepo.getAdminPlatformStats(),
            analyticsRepo.getUserGrowth(days),
            analyticsRepo.getContentGrowth(days),
            analyticsRepo.getTrendingCommunities(),
        ]);

    return {
        platformStats,
        userGrowth,
        contentGrowth,
        trendingCommunities,
    };
};
