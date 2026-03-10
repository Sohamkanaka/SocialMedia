import { baseApi } from "./baseApi";

// ─── Types ─────────────────────────────────────────────────

export interface CommentAuthor {
    id: string;
    displayName: string;
    avatar: string | null;
    role: string;
}

export interface Comment {
    id: string;
    content: string;
    authorId: string;
    postId: string;
    parentId: string | null;
    createdAt: string;
    author: CommentAuthor;
    children?: Comment[];
}

interface CommentsResponse {
    success: boolean;
    data: {
        items: Comment[];
        nextCursor: string | null;
        hasMore: boolean;
    };
}

interface SingleCommentResponse {
    success: boolean;
    data: { comment: Comment };
}

// ─── Comment API ───────────────────────────────────────────

export const commentApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getComments: builder.query<
            CommentsResponse["data"],
            { postId: string; cursor?: string; limit?: number }
        >({
            query: ({ postId, cursor, limit = 20 }) => ({
                url: `/posts/${postId}/comments`,
                params: { cursor, limit },
            }),
            transformResponse: (response: CommentsResponse) => response.data,
            providesTags: (_result, _error, { postId }) => [
                { type: "Comments", id: postId },
            ],
        }),

        addComment: builder.mutation<
            Comment,
            { postId: string; content: string; parentId?: string }
        >({
            query: ({ postId, ...body }) => ({
                url: `/posts/${postId}/comments`,
                method: "POST",
                body,
            }),
            transformResponse: (response: SingleCommentResponse) =>
                response.data.comment,
            invalidatesTags: (_result, _error, { postId }) => [
                { type: "Comments", id: postId },
                { type: "Post", id: postId },
            ],
            async onQueryStarted({ postId }, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    const { postApi } = await import("./postApi");
                    dispatch(
                        postApi.util.updateQueryData(
                            "getFeed",
                            {} as any,
                            (draft) => {
                                const post = draft.items.find((p) => p.id === postId);
                                if (post) {
                                    post._count.comments += 1;
                                }
                            }
                        )
                    );
                } catch {
                    // Ignore on error
                }
            },
        }),
    }),
});

export const { useGetCommentsQuery, useAddCommentMutation } = commentApi;
