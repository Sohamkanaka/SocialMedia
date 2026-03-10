import { baseApi } from "./baseApi";

// ─── Types ─────────────────────────────────────────────────

export interface NotificationActor {
    id: string;
    displayName: string;
    avatar: string | null;
}

export interface Notification {
    id: string;
    userId: string;
    actorId: string;
    type: "LIKE" | "COMMENT" | "FOLLOW" | "REPOST" | "MENTION";
    message: string;
    referenceId: string | null;
    referenceType: string | null;
    isRead: boolean;
    createdAt: string;
    actor: NotificationActor;
}

interface NotificationsResponse {
    success: boolean;
    data: {
        items: Notification[];
        nextCursor: string | null;
        hasMore: boolean;
    };
}

interface UnreadCountResponse {
    success: boolean;
    data: { count: number };
}

// ─── Notification API ──────────────────────────────────────

export const notificationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query<
            NotificationsResponse["data"],
            { cursor?: string; limit?: number } | void
        >({
            query: (params) => ({
                url: "/notifications",
                params: params || {},
            }),
            transformResponse: (response: NotificationsResponse) =>
                response.data,
            providesTags: ["Notification"],
        }),

        getUnreadCount: builder.query<number, void>({
            query: () => "/notifications/unread-count",
            transformResponse: (response: UnreadCountResponse) =>
                response.data.count,
            providesTags: [{ type: "Notification", id: "unread" }],
        }),

        markAsRead: builder.mutation<void, string>({
            query: (id) => ({
                url: `/notifications/${id}/read`,
                method: "PATCH",
            }),
            invalidatesTags: [
                "Notification",
                { type: "Notification", id: "unread" },
            ],
        }),

        markAllAsRead: builder.mutation<void, void>({
            query: () => ({
                url: "/notifications/read-all",
                method: "PATCH",
            }),
            invalidatesTags: [
                "Notification",
                { type: "Notification", id: "unread" },
            ],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useGetUnreadCountQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
} = notificationApi;
