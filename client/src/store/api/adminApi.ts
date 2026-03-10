import { baseApi } from "./baseApi";

// ─── Types ─────────────────────────────────────────────────

export interface AdminUser {
    id: string;
    email: string;
    displayName: string;
    role: "USER" | "MODERATOR" | "ADMIN";
    avatar: string | null;
    accountStatus: string;
    createdAt: string;
    _count: {
        posts: number;
        followers: number;
    };
}

export interface AdminUserListResponse {
    items: AdminUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface AdminUserFilters {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    accountStatus?: string;
}

export interface SystemSettingItem {
    key: string;
    value: string;
    label: string | null;
}

export interface SystemSettingsResponse {
    settings: Array<{
        id: string;
        key: string;
        value: string;
        label: string | null;
        category: string;
        updatedAt: string;
    }>;
    grouped: Record<string, SystemSettingItem[]>;
}

// ─── Admin API ────────────────────────────────────────────

export const adminApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdminUsers: builder.query<AdminUserListResponse, AdminUserFilters>({
            query: (params) => ({
                url: "/admin/users",
                params,
            }),
            transformResponse: (response: {
                success: boolean;
                data: AdminUserListResponse;
            }) => response.data,
            providesTags: ["AdminUsers"],
        }),

        updateUserRole: builder.mutation<
            AdminUser,
            { userId: string; role: string }
        >({
            query: ({ userId, role }) => ({
                url: `/admin/users/${userId}/role`,
                method: "PATCH",
                body: { role },
            }),
            transformResponse: (response: {
                success: boolean;
                data: AdminUser;
            }) => response.data,
            invalidatesTags: ["AdminUsers"],
        }),

        getSystemSettings: builder.query<SystemSettingsResponse, void>({
            query: () => "/admin/settings",
            transformResponse: (response: {
                success: boolean;
                data: SystemSettingsResponse;
            }) => response.data,
            providesTags: ["SystemSettings"],
        }),

        updateSystemSettings: builder.mutation<
            unknown,
            {
                settings: Array<{
                    key: string;
                    value: string;
                    label?: string;
                    category?: string;
                }>;
            }
        >({
            query: (body) => ({
                url: "/admin/settings",
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["SystemSettings"],
        }),
    }),
});

export const {
    useGetAdminUsersQuery,
    useUpdateUserRoleMutation,
    useGetSystemSettingsQuery,
    useUpdateSystemSettingsMutation,
} = adminApi;
