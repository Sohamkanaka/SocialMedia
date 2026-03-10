import { baseApi } from "./baseApi";

// ─── Types ─────────────────────────────────────────────────

export interface SuspendedUser {
    id: string;
    displayName: string;
    email: string;
    avatar: string | null;
    role: string;
    accountStatus: string;
    suspendedUntil: string | null;
    suspensionReason: string | null;
    createdAt: string;
}

export interface RepeatOffender extends SuspendedUser {
    actionCount: number;
}

export interface SuspensionListResponse {
    items: SuspendedUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface RepeatOffendersResponse {
    items: RepeatOffender[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface SuspendUserRequest {
    type: "TEMP" | "PERMANENT";
    reason: string;
    duration?: number;
}

// ─── Suspension API ────────────────────────────────────────

export const suspensionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        warnUser: builder.mutation<
            { user: SuspendedUser },
            { userId: string; reason: string }
        >({
            query: ({ userId, reason }) => ({
                url: `/users/${userId}/warn`,
                method: "POST",
                body: { reason },
            }),
            transformResponse: (response: {
                success: boolean;
                data: { user: SuspendedUser };
            }) => response.data,
            invalidatesTags: ["Suspension", "ModerationQueue"],
        }),

        suspendUser: builder.mutation<
            { user: SuspendedUser },
            { userId: string; data: SuspendUserRequest }
        >({
            query: ({ userId, data }) => ({
                url: `/users/${userId}/suspend`,
                method: "POST",
                body: data,
            }),
            transformResponse: (response: {
                success: boolean;
                data: { user: SuspendedUser };
            }) => response.data,
            invalidatesTags: ["Suspension"],
        }),

        submitAppeal: builder.mutation<
            { user: SuspendedUser },
            { userId: string; reason: string }
        >({
            query: ({ userId, reason }) => ({
                url: `/users/${userId}/appeal`,
                method: "POST",
                body: { reason },
            }),
            transformResponse: (response: {
                success: boolean;
                data: { user: SuspendedUser };
            }) => response.data,
            invalidatesTags: ["Suspension"],
        }),

        reinstateUser: builder.mutation<
            { user: SuspendedUser },
            { userId: string; reason?: string }
        >({
            query: ({ userId, reason }) => ({
                url: `/users/${userId}/reinstate`,
                method: "POST",
                body: { reason },
            }),
            transformResponse: (response: {
                success: boolean;
                data: { user: SuspendedUser };
            }) => response.data,
            invalidatesTags: ["Suspension"],
        }),

        getSuspendedUsers: builder.query<
            SuspensionListResponse,
            { page?: number; limit?: number }
        >({
            query: (params) => ({
                url: "/users/suspended",
                params,
            }),
            transformResponse: (response: {
                success: boolean;
                data: SuspensionListResponse;
            }) => response.data,
            providesTags: ["Suspension"],
        }),

        getAppeals: builder.query<
            SuspensionListResponse,
            { page?: number; limit?: number }
        >({
            query: (params) => ({
                url: "/users/appeals",
                params,
            }),
            transformResponse: (response: {
                success: boolean;
                data: SuspensionListResponse;
            }) => response.data,
            providesTags: ["Suspension"],
        }),

        getRepeatOffenders: builder.query<
            RepeatOffendersResponse,
            { page?: number; limit?: number }
        >({
            query: (params) => ({
                url: "/users/repeat-offenders",
                params,
            }),
            transformResponse: (response: {
                success: boolean;
                data: RepeatOffendersResponse;
            }) => response.data,
            providesTags: ["Suspension"],
        }),
    }),
});

export const {
    useWarnUserMutation,
    useSuspendUserMutation,
    useSubmitAppealMutation,
    useReinstateUserMutation,
    useGetSuspendedUsersQuery,
    useGetAppealsQuery,
    useGetRepeatOffendersQuery,
} = suspensionApi;
