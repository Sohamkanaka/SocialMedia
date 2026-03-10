import { baseApi } from "./baseApi";
import type { Post } from "./postApi";

// ─── Types ─────────────────────────────────────────────────

export interface ModerationPost extends Post {
    reportCount: number;
    categories: string[];
    riskScore: number;
    isFlagged: boolean;
}

export interface ModerationQueueResponse {
    items: ModerationPost[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ModerationQueueFilters {
    page?: number;
    limit?: number;
    status?: string;
    communityId?: string;
}

export interface ModerationActionUser {
    id: string;
    displayName: string;
    avatar: string | null;
}

export interface ModerationAction {
    id: string;
    actionType: string;
    targetUserId: string | null;
    postId: string | null;
    reason: string | null;
    performedBy: string;
    createdAt: string;
    targetUser: ModerationActionUser | null;
    performer: ModerationActionUser;
}

export interface AuditHistoryResponse {
    items: ModerationAction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ─── Moderation API ────────────────────────────────────────

export const moderationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getModerationQueue: builder.query<
            ModerationQueueResponse,
            ModerationQueueFilters
        >({
            query: (params) => ({
                url: "/moderation/queue",
                params,
            }),
            transformResponse: (response: {
                success: boolean;
                data: ModerationQueueResponse;
            }) => response.data,
            providesTags: ["ModerationQueue"],
        }),

        approvePost: builder.mutation<void, { postId: string; reason?: string }>(
            {
                query: ({ postId, reason }) => ({
                    url: `/moderation/${postId}/approve`,
                    method: "POST",
                    body: { reason },
                }),
                invalidatesTags: ["ModerationQueue", "Report", "Post", "Feed"],
            }
        ),

        removePost: builder.mutation<void, { postId: string; reason?: string }>(
            {
                query: ({ postId, reason }) => ({
                    url: `/moderation/${postId}/remove`,
                    method: "POST",
                    body: { reason },
                }),
                invalidatesTags: ["ModerationQueue", "Report", "Post", "Feed"],
            }
        ),

        warnUserFromPost: builder.mutation<
            void,
            { postId: string; reason?: string }
        >({
            query: ({ postId, reason }) => ({
                url: `/moderation/${postId}/warn-user`,
                method: "POST",
                body: { reason },
            }),
            invalidatesTags: ["ModerationQueue", "Suspension"],
        }),

        escalatePost: builder.mutation<
            void,
            { postId: string; reason?: string }
        >({
            query: ({ postId, reason }) => ({
                url: `/moderation/${postId}/escalate`,
                method: "POST",
                body: { reason },
            }),
            invalidatesTags: ["ModerationQueue"],
        }),

        getAuditHistory: builder.query<
            AuditHistoryResponse,
            { page?: number; limit?: number; targetUserId?: string; actionType?: string }
        >({
            query: (params) => ({
                url: "/moderation/audit",
                params,
            }),
            transformResponse: (response: {
                success: boolean;
                data: AuditHistoryResponse;
            }) => response.data,
        }),
    }),
});

export const {
    useGetModerationQueueQuery,
    useApprovePostMutation,
    useRemovePostMutation,
    useWarnUserFromPostMutation,
    useEscalatePostMutation,
    useGetAuditHistoryQuery,
} = moderationApi;
