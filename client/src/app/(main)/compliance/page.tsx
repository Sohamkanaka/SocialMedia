"use client";

import { useState } from "react";
import {
    FileText,
    Download,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Loader2,
    Search,
    Filter,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSelector } from "@/store/hooks";
import {
    useRequestDataExportMutation,
    useGetExportHistoryQuery,
    useGetAuditLogsQuery,
} from "@/store/api/complianceApi";
import type { DataExport, AuditLogEntry } from "@/store/api/complianceApi";
import { toast } from "sonner";

// ─── Status Badge ─────────────────────────────────────────

function ExportStatusBadge({ status }: { status: DataExport["status"] }) {
    const config: Record<
        string,
        {
            variant: "default" | "secondary" | "destructive" | "outline";
            icon: React.ComponentType<{ className?: string }>;
            label: string;
        }
    > = {
        PENDING: { variant: "outline", icon: Clock, label: "Pending" },
        PROCESSING: {
            variant: "secondary",
            icon: Loader2,
            label: "Processing",
        },
        COMPLETED: {
            variant: "default",
            icon: CheckCircle,
            label: "Completed",
        },
        FAILED: { variant: "destructive", icon: XCircle, label: "Failed" },
        EXPIRED: {
            variant: "outline",
            icon: AlertTriangle,
            label: "Expired",
        },
    };

    const { variant, icon: Icon, label } = config[status] || config.PENDING;

    return (
        <Badge variant={variant} className="gap-1">
            <Icon className="h-3 w-3" />
            {label}
        </Badge>
    );
}

// ─── Data Export Section ──────────────────────────────────

function DataExportSection() {
    const [format, setFormat] = useState<"JSON" | "CSV">("JSON");
    const [page, setPage] = useState(1);
    const [requestExport, { isLoading: isExporting }] =
        useRequestDataExportMutation();
    const { data: exports, isLoading } = useGetExportHistoryQuery({
        page,
        limit: 10,
    });

    const handleExport = async () => {
        try {
            await requestExport({ format }).unwrap();
            toast.success("Data export completed successfully");
        } catch {
            toast.error("Failed to generate data export");
        }
    };

    const getDownloadUrl = (exportItem: DataExport) => {
        if (
            exportItem.status !== "COMPLETED" ||
            !exportItem.filePath
        ) {
            return null;
        }
        if (
            exportItem.expiresAt &&
            new Date() > new Date(exportItem.expiresAt)
        ) {
            return null;
        }
        const baseUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        return `${baseUrl}/compliance/exports/${exportItem.id}/download`;
    };

    return (
        <div className="space-y-6">
            {/* Export Request Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        Request Data Export
                    </CardTitle>
                    <CardDescription>
                        Download a copy of all your data in JSON or CSV format.
                        Export links expire after 24 hours.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3">
                        <Select
                            value={format}
                            onValueChange={(v) =>
                                setFormat(v as "JSON" | "CSV")
                            }
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="JSON">JSON</SelectItem>
                                <SelectItem value="CSV">CSV</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="gap-2"
                        >
                            {isExporting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            {isExporting
                                ? "Generating..."
                                : "Request Export"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Export History */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Export History</CardTitle>
                    <CardDescription>
                        Your previous data export requests
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="h-16 rounded-lg"
                                />
                            ))}
                        </div>
                    ) : exports && exports.items.length > 0 ? (
                        <div className="space-y-3">
                            {exports.items.map((exportItem) => {
                                const downloadUrl =
                                    getDownloadUrl(exportItem);
                                return (
                                    <div
                                        key={exportItem.id}
                                        className="flex items-center justify-between p-3 rounded-lg border"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {exportItem.format} Export
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(
                                                        exportItem.createdAt
                                                    ).toLocaleString()}
                                                    {exportItem.fileSize &&
                                                        ` - ${(exportItem.fileSize / 1024).toFixed(1)} KB`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <ExportStatusBadge
                                                status={exportItem.status}
                                            />
                                            {downloadUrl && (
                                                <a
                                                    href={downloadUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-1"
                                                    >
                                                        <Download className="h-3 w-3" />
                                                        Download
                                                    </Button>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Pagination */}
                            {exports.totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page === 1}
                                        onClick={() =>
                                            setPage((p) => p - 1)
                                        }
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        Page {page} of{" "}
                                        {exports.totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            page >= exports.totalPages
                                        }
                                        onClick={() =>
                                            setPage((p) => p + 1)
                                        }
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-6">
                            No exports yet. Request one above to get started.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Audit Log Section (Admin) ────────────────────────────

function AuditLogSection() {
    const [page, setPage] = useState(1);
    const [entityTypeFilter, setEntityTypeFilter] = useState("all");
    const [actionFilter, setActionFilter] = useState("");

    const { data, isLoading } = useGetAuditLogsQuery({
        page,
        limit: 20,
        entityType:
            entityTypeFilter !== "all" ? entityTypeFilter : undefined,
        action: actionFilter || undefined,
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Audit Logs</CardTitle>
                <CardDescription>
                    System audit trail for compliance
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="flex items-center gap-3 mb-4">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select
                        value={entityTypeFilter}
                        onValueChange={(v) => {
                            setEntityTypeFilter(v);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Entity Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="User">User</SelectItem>
                            <SelectItem value="DataExport">
                                Data Export
                            </SelectItem>
                            <SelectItem value="SystemSetting">
                                Setting
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter by action..."
                            value={actionFilter}
                            onChange={(e) => {
                                setActionFilter(e.target.value);
                                setPage(1);
                            }}
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Log Entries */}
                {isLoading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 rounded-lg" />
                        ))}
                    </div>
                ) : data && data.items.length > 0 ? (
                    <div className="space-y-2">
                        {data.items.map((log: AuditLogEntry) => (
                            <div
                                key={log.id}
                                className="flex items-center justify-between p-3 rounded-lg border text-sm"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <Badge
                                        variant="outline"
                                        className="shrink-0"
                                    >
                                        {log.entityType}
                                    </Badge>
                                    <span className="font-medium truncate">
                                        {log.action
                                            .replace(/_/g, " ")
                                            .toLowerCase()
                                            .replace(/^\w/, (c) =>
                                                c.toUpperCase()
                                            )}
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0 ml-3">
                                    {new Date(
                                        log.createdAt
                                    ).toLocaleString()}
                                </span>
                            </div>
                        ))}

                        {/* Pagination */}
                        {data.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {page} of {data.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= data.totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-6">
                        No audit logs found
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Page ──────────────────────────────────────────────────

export default function CompliancePage() {
    const { user } = useAppSelector((state) => state.auth);
    const isAdmin = user?.role === "ADMIN";

    if (!user) {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <p className="text-center text-muted-foreground">
                    Please log in to access compliance tools.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    Compliance
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Data export and audit tools
                </p>
            </div>

            {isAdmin ? (
                <Tabs defaultValue="exports">
                    <TabsList>
                        <TabsTrigger value="exports">Data Exports</TabsTrigger>
                        <TabsTrigger value="audit-logs">
                            Audit Logs
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="exports" className="mt-4">
                        <DataExportSection />
                    </TabsContent>
                    <TabsContent value="audit-logs" className="mt-4">
                        <AuditLogSection />
                    </TabsContent>
                </Tabs>
            ) : (
                <DataExportSection />
            )}
        </div>
    );
}
