import { baseApi } from "./baseApi";

// ─── Types ─────────────────────────────────────────────────

export interface DataExport {
    id: string;
    userId: string;
    format: "JSON" | "CSV";
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "EXPIRED";
    filePath: string | null;
    fileSize: number | null;
    expiresAt: string | null;
    error: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ExportListResponse {
    items: DataExport[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface AuditLogEntry {
    id: string;
    userId: string | null;
    action: string;
    entityType: string;
    entityId: string | null;
    metadata: string | null;
    ipAddress: string | null;
    createdAt: string;
}

export interface AuditLogResponse {
    items: AuditLogEntry[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface AuditLogFilters {
    page?: number;
    limit?: number;
    entityType?: string;
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
}

// ─── Compliance API ───────────────────────────────────────

export const complianceApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        requestDataExport: builder.mutation<
            { message: string; exportId: string },
            { format: "JSON" | "CSV" }
        >({
            query: (body) => ({
                url: "/compliance/export",
                method: "POST",
                body,
            }),
            transformResponse: (response: {
                success: boolean;
                data: { message: string; exportId: string };
            }) => response.data,
            invalidatesTags: ["DataExport"],
        }),

        getExportHistory: builder.query<
            ExportListResponse,
            { page?: number; limit?: number }
        >({
            query: (params) => ({
                url: "/compliance/exports",
                params,
            }),
            transformResponse: (response: {
                success: boolean;
                data: ExportListResponse;
            }) => response.data,
            providesTags: ["DataExport"],
        }),

        getAuditLogs: builder.query<AuditLogResponse, AuditLogFilters>({
            query: (params) => ({
                url: "/compliance/audit-logs",
                params,
            }),
            transformResponse: (response: {
                success: boolean;
                data: AuditLogResponse;
            }) => response.data,
            providesTags: ["AuditLog"],
        }),
    }),
});

export const {
    useRequestDataExportMutation,
    useGetExportHistoryQuery,
    useGetAuditLogsQuery,
} = complianceApi;
