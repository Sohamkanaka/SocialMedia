"use client";

import { useState } from "react";
import {
    BarChart3,
    UserX,
    MessageSquare,
    AlertTriangle,
    History,
    Shield,
    Ban,
    UserCheck,
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useAppSelector } from "@/store/hooks";
import {
    useGetSuspendedUsersQuery,
    useGetAppealsQuery,
    useGetRepeatOffendersQuery,
    useSuspendUserMutation,
    useReinstateUserMutation,
} from "@/store/api/suspensionApi";
import { useGetAuditHistoryQuery } from "@/store/api/moderationApi";
import type { SuspendedUser, RepeatOffender } from "@/store/api/suspensionApi";
import type { ModerationAction } from "@/store/api/moderationApi";
import { formatDistanceToNow } from "@/lib/date-utils";

// ─── Status Badge ──────────────────────────────────────────

function AccountStatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string; variant: "destructive" | "secondary" | "outline" | "default" }> = {
        ACTIVE: { label: "Active", variant: "default" },
        WARNING: { label: "Warning", variant: "secondary" },
        TEMP_SUSPENDED: { label: "Temp Suspended", variant: "destructive" },
        PERMANENTLY_BANNED: { label: "Permanently Banned", variant: "destructive" },
        APPEAL: { label: "Appeal", variant: "secondary" },
        REINSTATED: { label: "Reinstated", variant: "outline" },
    };

    const config = statusConfig[status] || { label: status, variant: "outline" as const };

    return <Badge variant={config.variant}>{config.label}</Badge>;
}

// ─── Suspend User Dialog ───────────────────────────────────

interface SuspendDialogProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    displayName: string;
}

function SuspendUserDialog({ isOpen, onClose, userId, displayName }: SuspendDialogProps) {
    const [type, setType] = useState<"TEMP" | "PERMANENT">("TEMP");
    const [reason, setReason] = useState("");
    const [duration, setDuration] = useState("7");
    const [suspendUser, { isLoading }] = useSuspendUserMutation();

    const handleSubmit = async () => {
        try {
            await suspendUser({
                userId,
                data: {
                    type,
                    reason,
                    ...(type === "TEMP" && { duration: parseInt(duration, 10) }),
                },
            }).unwrap();
            onClose();
            setReason("");
        } catch {
            // Error handled by RTK Query
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Suspend User</DialogTitle>
                    <DialogDescription>
                        Suspend {displayName} from the platform.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Suspension Type</Label>
                        <Select value={type} onValueChange={(v) => setType(v as "TEMP" | "PERMANENT")}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TEMP">Temporary</SelectItem>
                                <SelectItem value="PERMANENT">Permanent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {type === "TEMP" && (
                        <div className="space-y-2">
                            <Label>Duration (days)</Label>
                            <Input
                                type="number"
                                min="1"
                                max="365"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Reason</Label>
                        <Textarea
                            placeholder="Provide a reason for suspension..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="min-h-[80px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={!reason || isLoading}
                    >
                        {isLoading ? "Suspending..." : "Suspend User"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Suspended Users Tab ───────────────────────────────────

function SuspendedUsersTab() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useGetSuspendedUsersQuery({ page, limit: 20 });

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (!data || data.items.length === 0) {
        return (
            <EmptyState
                icon={UserCheck}
                title="No Suspended Users"
                description="There are currently no suspended users."
            />
        );
    }

    return (
        <div className="space-y-3">
            {data.items.map((user) => (
                <SuspendedUserCard key={user.id} user={user} />
            ))}
            <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
        </div>
    );
}

// ─── Appeals Tab ───────────────────────────────────────────

function AppealsTab() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useGetAppealsQuery({ page, limit: 20 });
    const [reinstateUser] = useReinstateUserMutation();

    const handleReinstate = async (userId: string) => {
        try {
            await reinstateUser({ userId, reason: "Appeal approved" }).unwrap();
        } catch {
            // Error handled by RTK Query
        }
    };

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (!data || data.items.length === 0) {
        return (
            <EmptyState
                icon={MessageSquare}
                title="No Pending Appeals"
                description="There are no pending appeals to review."
            />
        );
    }

    return (
        <div className="space-y-3">
            {data.items.map((user) => (
                <Card key={user.id} className="transition-all hover:shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-semibold">{user.displayName}</h4>
                                    <AccountStatusBadge status={user.accountStatus} />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {user.email}
                                </p>
                                {user.suspensionReason && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Reason: {user.suspensionReason}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                                    onClick={() => handleReinstate(user.id)}
                                >
                                    <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                                    Reinstate
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                >
                                    <Ban className="h-3.5 w-3.5 mr-1.5" />
                                    Deny
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
            <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
        </div>
    );
}

// ─── Repeat Offenders Tab ──────────────────────────────────

function RepeatOffendersTab() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useGetRepeatOffendersQuery({ page, limit: 20 });
    const [suspendTarget, setSuspendTarget] = useState<RepeatOffender | null>(null);

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (!data || data.items.length === 0) {
        return (
            <EmptyState
                icon={AlertTriangle}
                title="No Repeat Offenders"
                description="No users with multiple moderation actions found."
            />
        );
    }

    return (
        <>
            <div className="space-y-3">
                {data.items.map((offender) => (
                    <Card key={offender.id} className="transition-all hover:shadow-md">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-semibold">
                                            {offender.displayName}
                                        </h4>
                                        <AccountStatusBadge status={offender.accountStatus} />
                                        <Badge variant="destructive" className="text-[10px]">
                                            {offender.actionCount} actions
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {offender.email}
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setSuspendTarget(offender)}
                                >
                                    <Ban className="h-3.5 w-3.5 mr-1.5" />
                                    Suspend
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
            </div>

            {suspendTarget && (
                <SuspendUserDialog
                    isOpen={true}
                    onClose={() => setSuspendTarget(null)}
                    userId={suspendTarget.id}
                    displayName={suspendTarget.displayName}
                />
            )}
        </>
    );
}

// ─── Audit History Tab ─────────────────────────────────────

function AuditHistoryTab() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useGetAuditHistoryQuery({ page, limit: 20 });

    const formatActionType = (type: string) =>
        type.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

    const getActionColor = (type: string) => {
        const colors: Record<string, string> = {
            APPROVE: "text-green-600",
            REMOVE: "text-red-600",
            WARN_USER: "text-amber-600",
            ESCALATE: "text-purple-600",
            SUSPEND: "text-red-700",
            REINSTATE: "text-blue-600",
        };
        return colors[type] || "text-muted-foreground";
    };

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (!data || data.items.length === 0) {
        return (
            <EmptyState
                icon={History}
                title="No Actions Yet"
                description="No moderation actions have been recorded."
            />
        );
    }

    return (
        <div className="space-y-3">
            {data.items.map((action: ModerationAction) => (
                <Card key={action.id} className="transition-all hover:shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-semibold ${getActionColor(action.actionType)}`}>
                                        {formatActionType(action.actionType)}
                                    </span>
                                    {action.targetUser && (
                                        <span className="text-sm text-muted-foreground">
                                            on {action.targetUser.displayName}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    by {action.performer.displayName} - {formatDistanceToNow(action.createdAt)}
                                </p>
                                {action.reason && (
                                    <p className="text-xs text-muted-foreground">
                                        Reason: {action.reason}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
            <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
        </div>
    );
}

// ─── Shared Components ─────────────────────────────────────

function SuspendedUserCard({ user }: { user: SuspendedUser }) {
    return (
        <Card className="transition-all hover:shadow-md">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold">{user.displayName}</h4>
                            <AccountStatusBadge status={user.accountStatus} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
                        {user.suspensionReason && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Reason: {user.suspensionReason}
                            </p>
                        )}
                        {user.suspendedUntil && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Until: {new Date(user.suspendedUntil).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
        </div>
    );
}

function Pagination({
    page,
    totalPages,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 pt-4">
            <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
            >
                Previous
            </Button>
            <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
            </span>
            <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Next
            </Button>
        </div>
    );
}

// ─── Page ──────────────────────────────────────────────────

export default function ReportsPage() {
    const { user } = useAppSelector((state) => state.auth);

    // Role check
    if (!user || user.role !== "ADMIN") {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <EmptyState
                    icon={Shield}
                    title="Access Denied"
                    description="You do not have permission to access the reports dashboard."
                />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-primary" />
                    User Reports & Administration
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage suspensions, appeals, and review moderation history
                </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="suspended" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="suspended" className="gap-1.5">
                        <UserX className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Suspensions</span>
                    </TabsTrigger>
                    <TabsTrigger value="appeals" className="gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Appeals</span>
                    </TabsTrigger>
                    <TabsTrigger value="offenders" className="gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Repeat Offenders</span>
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="gap-1.5">
                        <History className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Audit History</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="suspended">
                    <SuspendedUsersTab />
                </TabsContent>

                <TabsContent value="appeals">
                    <AppealsTab />
                </TabsContent>

                <TabsContent value="offenders">
                    <RepeatOffendersTab />
                </TabsContent>

                <TabsContent value="audit">
                    <AuditHistoryTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
