import { baseApi } from "./baseApi";

export interface User {
    id: string;
    email: string;
    displayName: string;
    role: "USER" | "MODERATOR" | "ADMIN";
    avatar: string | null;
    bio: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export interface MeResponse {
    success: boolean;
    data: {
        user: User;
    };
}

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        signup: builder.mutation<
            AuthResponse,
            { email: string; password: string; displayName: string }
        >({
            query: (body) => ({
                url: "/auth/signup",
                method: "POST",
                body,
            }),
            invalidatesTags: ["User", "Feed", "Post", "Bookmarks", "Profile", "Community", "CommunityMembers", "Followers"],
        }),

        login: builder.mutation<
            AuthResponse,
            { email: string; password: string }
        >({
            query: (body) => ({
                url: "/auth/login",
                method: "POST",
                body,
            }),
            invalidatesTags: ["User", "Feed", "Post", "Bookmarks", "Profile", "Community", "CommunityMembers", "Followers"],
        }),

        getMe: builder.query<MeResponse, void>({
            query: () => "/auth/me",
            providesTags: ["User"],
        }),
    }),
});

export const { useSignupMutation, useLoginMutation, useGetMeQuery } = authApi;
