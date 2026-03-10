import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
        prepareHeaders: (headers, { getState }) => {
            let token = (getState() as RootState).auth.token;
            if (!token && typeof window !== "undefined") {
                token = localStorage.getItem("token");
            }
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["User", "Post", "Feed", "Profile", "Followers", "Bookmarks", "Community", "CommunityMembers", "Comments", "Notification", "Search", "Report", "ModerationQueue", "Suspension", "Analytics", "DataExport", "AuditLog", "AdminUsers", "SystemSettings"],
    endpoints: () => ({}),
});
