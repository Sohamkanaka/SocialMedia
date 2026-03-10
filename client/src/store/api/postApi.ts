import { baseApi } from "./baseApi";

// ─── Types ─────────────────────────────────────────────────

export interface PostAuthor {
    id: string;
    displayName: string;
    avatar: string | null;
    role: string;
}

export interface PollOption {
    id: string;
    text: string;
    votesCount: number;
}

export interface PostCommunity {
    id: string;
    name: string;
    slug: string;
}

export interface Post {
    id: string;
    title: string;
    content: string | null;
    type: "TEXT" | "IMAGE" | "VIDEO" | "POLL" | "THREAD";
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    mediaUrl: string | null;
    authorId: string;
    communityId: string | null;
    scheduledAt: string | null;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    author: PostAuthor;
    community: PostCommunity | null;
    pollOptions: PollOption[];
    _count: {
        comments: number;
        likes: number;
        bookmarks: number;
        reposts: number;
    };
    interactions?: {
        isLiked: boolean;
        isBookmarked: boolean;
        isReposted: boolean;
    } | null;
    repostedBy?: {
        id: string;
        displayName: string;
    } | null;
}

export interface FeedResponse {
    success: boolean;
    data: {
        items: Post[];
        nextCursor: string | null;
        hasMore: boolean;
    };
}

export interface SinglePostResponse {
    success: boolean;
    data: {
        post: Post;
    };
}

export interface CreatePostRequest {
    title: string;
    content?: string;
    type?: "TEXT" | "IMAGE" | "VIDEO" | "POLL" | "THREAD";
    status?: "DRAFT" | "PUBLISHED";
    mediaUrl?: string;
    communityId?: string;
    scheduledAt?: string;
    pollOptions?: { text: string }[];
}

export interface UpdatePostRequest {
    title?: string;
    content?: string;
    mediaUrl?: string | null;
}

// ─── Post API ──────────────────────────────────────────────

export const postApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getFeed: builder.query<
            FeedResponse["data"],
            { cursor?: string; limit?: number }
        >({
            query: ({ cursor, limit = 10 }) => ({
                url: "/posts/feed",
                params: { cursor, limit },
            }),
            transformResponse: (response: FeedResponse) => response.data,
            serializeQueryArgs: ({ endpointName }) => endpointName,
            merge: (currentCache, newItems, { arg }) => {
                if (!newItems) return;

                if (!arg.cursor) {
                    currentCache.items = newItems.items;
                } else {
                    const existingIds = new Set(currentCache.items.map(item => item.id));
                    const newUniqueItems = newItems.items.filter(item => !existingIds.has(item.id));
                    currentCache.items.push(...newUniqueItems);
                }

                currentCache.hasMore = newItems.hasMore;
                currentCache.nextCursor = newItems.nextCursor;
            },
            forceRefetch: ({ currentArg, previousArg }) =>
                currentArg?.cursor !== previousArg?.cursor,
            providesTags: ["Feed"],
        }),

        getPost: builder.query<Post, string>({
            query: (id) => `/posts/${id}`,
            transformResponse: (response: SinglePostResponse) =>
                response.data.post,
            providesTags: (_result, _error, id) => [{ type: "Post", id }],
        }),

        createPost: builder.mutation<Post, CreatePostRequest>({
            query: (body) => ({
                url: "/posts",
                method: "POST",
                body,
            }),
            transformResponse: (response: SinglePostResponse) =>
                response.data.post,
            invalidatesTags: ["Feed", "Post"],
        }),

        updatePost: builder.mutation<
            Post,
            { id: string; data: UpdatePostRequest }
        >({
            query: ({ id, data }) => ({
                url: `/posts/${id}`,
                method: "PATCH",
                body: data,
            }),
            transformResponse: (response: SinglePostResponse) =>
                response.data.post,
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Post", id },
                "Feed",
                "Post",
            ],
        }),

        deletePost: builder.mutation<void, string>({
            query: (id) => ({
                url: `/posts/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Feed", "Post"],
        }),

        updatePostStatus: builder.mutation<
            Post,
            { id: string; status: string }
        >({
            query: ({ id, status }) => ({
                url: `/posts/${id}/status`,
                method: "PATCH",
                body: { status },
            }),
            transformResponse: (response: SinglePostResponse) =>
                response.data.post,
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Post", id },
                "Feed",
                "Post",
            ],
        }),

        likePost: builder.mutation<void, string>({
            query: (id) => ({
                url: `/posts/${id}/like`,
                method: "POST",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Post", id },
            ],
        }),

        unlikePost: builder.mutation<void, string>({
            query: (id) => ({
                url: `/posts/${id}/like`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Post", id },
            ],
        }),

        bookmarkPost: builder.mutation<void, string>({
            query: (id) => ({
                url: `/posts/${id}/bookmark`,
                method: "POST",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Post", id },
                "Bookmarks",
            ],
        }),

        unbookmarkPost: builder.mutation<void, string>({
            query: (id) => ({
                url: `/posts/${id}/bookmark`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Post", id },
                "Bookmarks",
            ],
        }),

        repostPost: builder.mutation<void, string>({
            query: (id) => ({
                url: `/posts/${id}/repost`,
                method: "POST",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Post", id },
            ],
        }),

        unrepostPost: builder.mutation<void, string>({
            query: (id) => ({
                url: `/posts/${id}/repost`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Post", id },
            ],
        }),

        uploadFile: builder.mutation<{ url: string }, FormData>({
            query: (formData) => ({
                url: "/upload",
                method: "POST",
                body: formData,
            }),
            transformResponse: (response: {
                success: boolean;
                data: { url: string };
            }) => response.data,
        }),
    }),
});

export const {
    useGetFeedQuery,
    useGetPostQuery,
    useCreatePostMutation,
    useUpdatePostMutation,
    useDeletePostMutation,
    useUpdatePostStatusMutation,
    useLikePostMutation,
    useUnlikePostMutation,
    useBookmarkPostMutation,
    useUnbookmarkPostMutation,
    useRepostPostMutation,
    useUnrepostPostMutation,
    useUploadFileMutation,
} = postApi;
