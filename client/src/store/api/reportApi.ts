import { baseApi } from "./baseApi";

// ─── Types ─────────────────────────────────────────────────

export interface ReportUser {
    id: string;
    displayName: string;
    avatar: string | null;
}

export interface Report {
    id: string;
    reporterId: string;
    targetType: "POST" | "COMMENT" | "USER";
    targetId: string;
    reason: "HATE_SPEECH" | "SPAM" | "MISINFORMATION" | "HARASSMENT" | "NSFW";
    status: "PENDING" | "REVIEWED" | "RESOLVED";
    resolvedBy: string | null;
    resolvedAt: string | null;
    createdAt: string;
    reporter: ReportUser;
    resolver: ReportUser | null;
}

export interface CreateReportRequest {
    targetType: "POST" | "COMMENT" | "USER";
    targetId: string;
    reason: "HATE_SPEECH" | "SPAM" | "MISINFORMATION" | "HARASSMENT" | "NSFW";
}

export interface ReportListResponse {
    items: Report[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ReportFilters {
    status?: string;
    reason?: string;
    targetType?: string;
    page?: number;
    limit?: number;
}

// ─── Report API ────────────────────────────────────────────

export const reportApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        submitReport: builder.mutation<
            { report: Report; reportCount: number; shouldEscalate: boolean },
            CreateReportRequest
        >({
            query: (body) => ({
                url: "/reports",
                method: "POST",
                body,
            }),
            transformResponse: (response: {
                success: boolean;
                data: {
                    report: Report;
                    reportCount: number;
                    shouldEscalate: boolean;
                };
            }) => response.data,
            invalidatesTags: ["Report", "ModerationQueue"],
        }),

        getReports: builder.query<ReportListResponse, ReportFilters>({
            query: (params) => ({
                url: "/reports",
                params,
            }),
            transformResponse: (response: {
                success: boolean;
                data: ReportListResponse;
            }) => response.data,
            providesTags: ["Report"],
        }),

        updateReportStatus: builder.mutation<
            Report,
            { id: string; status: string }
        >({
            query: ({ id, status }) => ({
                url: `/reports/${id}`,
                method: "PATCH",
                body: { status },
            }),
            transformResponse: (response: {
                success: boolean;
                data: { report: Report };
            }) => response.data.report,
            invalidatesTags: ["Report"],
        }),
    }),
});

export const {
    useSubmitReportMutation,
    useGetReportsQuery,
    useUpdateReportStatusMutation,
} = reportApi;
