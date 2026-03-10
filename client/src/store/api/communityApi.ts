import { baseApi } from "./baseApi";
import type { Post } from "./postApi";

// ─── Types ─────────────────────────────────────────────────

export interface CommunityCreator {
    id: string;
    displayName: string;
    avatar: string | null;
}

export interface CommunityMember {
    id: string;
    userId: string;
    communityId: string;
    role: "MEMBER" | "MODERATOR";
    joinedAt: string;
    user: {
        id: string;
        displayName: string;
        avatar: string | null;
        bio: string | null;
        role: string;
    };
}

export interface Community {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    creatorId: string;
    createdAt: string;
    creator: CommunityCreator;
    _count: {
        members: number;
        posts: number;
    };
    isMember?: boolean;
    memberRole?: "MEMBER" | "MODERATOR" | null;
}

interface CommunitiesResponse {
    success: boolean;
    data: {
        items: Community[];
        nextCursor: string | null;
        hasMore: boolean;
    };
}

interface SingleCommunityResponse {
    success: boolean;
    data: { community: Community };
}

interface CommunityFeedResponse {
    success: boolean;
    data: {
        items: Post[];
        nextCursor: string | null;
        hasMore: boolean;
    };
}

interface MembersResponse {
    success: boolean;
    data: {
        items: CommunityMember[];
        nextCursor: string | null;
        hasMore: boolean;
    };
}

export interface CreateCommunityRequest {
    name: string;
    description?: string;
}

// ─── Community API ─────────────────────────────────────────

export const communityApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCommunities: builder.query<
            CommunitiesResponse["data"],
            { cursor?: string; limit?: number } | void
        >({
            query: (params) => ({
                url: "/communities",
                params: params || {},
            }),
            transformResponse: (response: CommunitiesResponse) => response.data,
            providesTags: ["Community"],
        }),

        getCommunity: builder.query<Community, string>({
            query: (id) => `/communities/${id}`,
            transformResponse: (response: SingleCommunityResponse) =>
                response.data.community,
            providesTags: (_result, _error, id) => [{ type: "Community", id }],
        }),

        getCommunityFeed: builder.query<
            CommunityFeedResponse["data"],
            { communityId: string; cursor?: string; limit?: number }
        >({
            query: ({ communityId, cursor, limit = 10 }) => ({
                url: `/communities/${communityId}/feed`,
                params: { cursor, limit },
            }),
            transformResponse: (response: CommunityFeedResponse) =>
                response.data,
            providesTags: (_result, _error, { communityId }) => [
                { type: "Community", id: `feed-${communityId}` },
            ],
        }),

        getCommunityMembers: builder.query<
            MembersResponse["data"],
            { communityId: string; cursor?: string; limit?: number }
        >({
            query: ({ communityId, cursor, limit = 20 }) => ({
                url: `/communities/${communityId}/members`,
                params: { cursor, limit },
            }),
            transformResponse: (response: MembersResponse) => response.data,
            providesTags: (_result, _error, { communityId }) => [
                { type: "CommunityMembers", id: communityId },
            ],
        }),

        createCommunity: builder.mutation<Community, CreateCommunityRequest>({
            query: (body) => ({
                url: "/communities",
                method: "POST",
                body,
            }),
            transformResponse: (response: SingleCommunityResponse) =>
                response.data.community,
            invalidatesTags: ["Community"],
        }),

        joinCommunity: builder.mutation<void, string>({
            query: (id) => ({
                url: `/communities/${id}/join`,
                method: "POST",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Community", id },
                "Community",
                { type: "CommunityMembers", id },
            ],
        }),

        leaveCommunity: builder.mutation<void, string>({
            query: (id) => ({
                url: `/communities/${id}/leave`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Community", id },
                "Community",
                { type: "CommunityMembers", id },
            ],
        }),

        updateMemberRole: builder.mutation<
            void,
            { communityId: string; userId: string; role: "MEMBER" | "MODERATOR" }
        >({
            query: ({ communityId, userId, role }) => ({
                url: `/communities/${communityId}/members/${userId}/role`,
                method: "PATCH",
                body: { role },
            }),
            invalidatesTags: (_result, _error, { communityId }) => [
                { type: "CommunityMembers", id: communityId },
            ],
        }),
    }),
});

export const {
    useGetCommunitiesQuery,
    useGetCommunityQuery,
    useGetCommunityFeedQuery,
    useGetCommunityMembersQuery,
    useCreateCommunityMutation,
    useJoinCommunityMutation,
    useLeaveCommunityMutation,
    useUpdateMemberRoleMutation,
} = communityApi;
