import { baseApi } from "./baseApi";
import type { Post } from "./postApi";

// ─── Types ─────────────────────────────────────────────────

export interface UserProfile {
    id: string;
    email: string;
    displayName: string;
    role: string;
    avatar: string | null;
    bio: string | null;
    createdAt: string;
    updatedAt: string;
    isFollowing: boolean;
    _count: {
        posts: number;
        followers: number;
        following: number;
    };
}

export interface FollowUser {
    id: string;
    displayName: string;
    avatar: string | null;
    bio: string | null;
    isFollowing: boolean;
}

interface ProfileResponse {
    success: boolean;
    data: { user: UserProfile };
}

interface PaginatedPostsResponse {
    success: boolean;
    data: {
        items: Post[];
        nextCursor: string | null;
        hasMore: boolean;
    };
}

interface PaginatedUsersResponse {
    success: boolean;
    data: {
        items: FollowUser[];
        nextCursor: string | null;
        hasMore: boolean;
    };
}

export interface UpdateProfileRequest {
    displayName?: string;
    bio?: string | null;
    avatar?: string | null;
}

// ─── User API ──────────────────────────────────────────────

export const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProfile: builder.query<UserProfile, string>({
            query: (id) => `/users/${id}`,
            transformResponse: (response: ProfileResponse) =>
                response.data.user,
            providesTags: (_result, _error, id) => [{ type: "Profile", id }],
        }),

        getUserPosts: builder.query<
            PaginatedPostsResponse["data"],
            { userId: string; cursor?: string; limit?: number; status?: string }
        >({
            query: ({ userId, cursor, limit = 10, status }) => ({
                url: `/users/${userId}/posts`,
                params: { cursor, limit, status },
            }),
            transformResponse: (response: PaginatedPostsResponse) =>
                response.data,
            providesTags: (_result, _error, { userId, status }) => [
                { type: "Post", id: `user-${userId}-${status || "all"}` },
            ],
        }),

        updateProfile: builder.mutation<UserProfile, UpdateProfileRequest>({
            query: (body) => ({
                url: "/users/me",
                method: "PATCH",
                body,
            }),
            transformResponse: (response: ProfileResponse) =>
                response.data.user,
            invalidatesTags: ["Profile", "User"],
        }),

        followUser: builder.mutation<void, string>({
            query: (id) => ({
                url: `/users/${id}/follow`,
                method: "POST",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Profile", id },
                "Followers",
                "Feed",
            ],
        }),

        unfollowUser: builder.mutation<void, string>({
            query: (id) => ({
                url: `/users/${id}/follow`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Profile", id },
                "Followers",
                "Feed",
            ],
        }),

        getFollowers: builder.query<
            PaginatedUsersResponse["data"],
            { userId: string; cursor?: string; limit?: number }
        >({
            query: ({ userId, cursor, limit = 20 }) => ({
                url: `/users/${userId}/followers`,
                params: { cursor, limit },
            }),
            transformResponse: (response: PaginatedUsersResponse) =>
                response.data,
            providesTags: ["Followers"],
        }),

        getFollowing: builder.query<
            PaginatedUsersResponse["data"],
            { userId: string; cursor?: string; limit?: number }
        >({
            query: ({ userId, cursor, limit = 20 }) => ({
                url: `/users/${userId}/following`,
                params: { cursor, limit },
            }),
            transformResponse: (response: PaginatedUsersResponse) =>
                response.data,
            providesTags: ["Followers"],
        }),

        getBookmarks: builder.query<
            PaginatedPostsResponse["data"],
            { cursor?: string; limit?: number }
        >({
            query: ({ cursor, limit = 10 }) => ({
                url: "/users/me/bookmarks",
                params: { cursor, limit },
            }),
            transformResponse: (response: PaginatedPostsResponse) =>
                response.data,
            providesTags: ["Bookmarks"],
        }),
    }),
});

export const {
    useGetProfileQuery,
    useGetUserPostsQuery,
    useUpdateProfileMutation,
    useFollowUserMutation,
    useUnfollowUserMutation,
    useGetFollowersQuery,
    useGetFollowingQuery,
    useGetBookmarksQuery,
} = userApi;
