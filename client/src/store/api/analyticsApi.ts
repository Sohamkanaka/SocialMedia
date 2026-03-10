import { baseApi } from "./baseApi";

// ─── Types ─────────────────────────────────────────────────

export interface CreatorStats {
    postCount: number;
    totalLikes: number;
    totalComments: number;
    totalReposts: number;
    followerCount: number;
    engagementRate: number;
}

export interface PostPerformance {
    id: string;
    title: string;
    createdAt: string;
    _count: {
        likes: number;
        comments: number;
        reposts: number;
        bookmarks: number;
    };
}

export interface GrowthDataPoint {
    date: string;
    count: number;
}

export interface CreatorAnalyticsResponse {
    stats: CreatorStats;
    postPerformance: PostPerformance[];
    followerGrowth: GrowthDataPoint[];
}

export interface PlatformStats {
    totalUsers: number;
    activeUsers: number;
    totalPosts: number;
    flaggedPostCount: number;
    flaggedRatio: number;
    totalReports: number;
    pendingReports: number;
    moderationActions: number;
}

export interface TrendingCommunity {
    id: string;
    name: string;
    slug: string;
    _count: {
        posts: number;
        members: number;
    };
}

export interface AdminAnalyticsResponse {
    platformStats: PlatformStats;
    userGrowth: GrowthDataPoint[];
    contentGrowth: GrowthDataPoint[];
    trendingCommunities: TrendingCommunity[];
}

// ─── Analytics API ────────────────────────────────────────

export const analyticsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCreatorAnalytics: builder.query<
            CreatorAnalyticsResponse,
            { days?: number }
        >({
            query: (params) => ({
                url: "/analytics/creator",
                params,
            }),
            transformResponse: (response: {
                success: boolean;
                data: CreatorAnalyticsResponse;
            }) => response.data,
            providesTags: ["Analytics"],
        }),

        getAdminAnalytics: builder.query<
            AdminAnalyticsResponse,
            { days?: number }
        >({
            query: (params) => ({
                url: "/analytics/admin",
                params,
            }),
            transformResponse: (response: {
                success: boolean;
                data: AdminAnalyticsResponse;
            }) => response.data,
            providesTags: ["Analytics"],
        }),
    }),
});

export const { useGetCreatorAnalyticsQuery, useGetAdminAnalyticsQuery } =
    analyticsApi;
