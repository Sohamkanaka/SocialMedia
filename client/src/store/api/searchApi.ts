import { baseApi } from "./baseApi";
import type { Post } from "./postApi";

// ─── Types ─────────────────────────────────────────────────

export interface SearchUser {
    id: string;
    displayName: string;
    avatar: string | null;
    bio: string | null;
    role: string;
    _count: {
        followers: number;
        following: number;
        posts: number;
    };
    isFollowing: boolean;
}

export interface SearchCommunity {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: string;
    creator: {
        id: string;
        displayName: string;
        avatar: string | null;
    };
    _count: {
        members: number;
        posts: number;
    };
}

export interface TrendingHashtag {
    tag: string;
    count: number;
}

export interface SuggestedUser {
    id: string;
    displayName: string;
    avatar: string | null;
    bio: string | null;
    _count: {
        followers: number;
        posts: number;
    };
    isFollowing: boolean;
}

interface SearchResponse {
    success: boolean;
    data: {
        posts?: Post[];
        users?: SearchUser[];
        communities?: SearchCommunity[];
    };
}

interface TrendingResponse {
    success: boolean;
    data: { trending: TrendingHashtag[] };
}

interface SuggestedResponse {
    success: boolean;
    data: { users: SuggestedUser[] };
}

// ─── Search API ────────────────────────────────────────────

export const searchApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        search: builder.query<
            SearchResponse["data"],
            { q: string; type?: string; communityId?: string }
        >({
            query: (params) => ({
                url: "/search",
                params,
            }),
            transformResponse: (response: SearchResponse) => response.data,
            providesTags: ["Search"],
        }),

        getTrending: builder.query<TrendingHashtag[], void>({
            query: () => "/search/trending",
            transformResponse: (response: TrendingResponse) =>
                response.data.trending,
        }),

        getSuggestedUsers: builder.query<SuggestedUser[], void>({
            query: () => "/search/suggested",
            transformResponse: (response: SuggestedResponse) =>
                response.data.users,
        }),
    }),
});

export const {
    useSearchQuery,
    useGetTrendingQuery,
    useGetSuggestedUsersQuery,
} = searchApi;
