"use client";

import { useState } from "react";
import {
    Shield,
    CheckCircle,
    Trash2,
    AlertTriangle,
    ArrowUpCircle,
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useAppSelector } from "@/store/hooks";
import {
    useGetModerationQueueQuery,
    useApprovePostMutation,
    useRemovePostMutation,
    useWarnUserFromPostMutation,
    useEscalatePostMutation,
} from "@/store/api/moderationApi";
import type { ModerationPost } from "@/store/api/moderationApi";
import { formatDistanceToNow } from "@/lib/date-utils";

// ─── Risk Score Badge ──────────────────────────────────────

function RiskScoreBadge({ score }: { score: number }) {
    const getVariant = () => {
        if (score >= 70) return "destructive";
        if (score >= 40) return "secondary";
        return "outline";
    };

    const getLabel = () => {
        if (score >= 70) return "High Risk";
        if (score >= 40) return "Medium Risk";
        return "Low Risk";
    };

    return (
        <Badge variant={getVariant() as "destructive" | "secondary" | "outline"}>
            {getLabel()} ({score})
        </Badge>
    );
}

// ─── Category Badges ───────────────────────────────────────

function CategoryBadges({ categories }: { categories: string[] }) {
    const formatCategory = (cat: string) =>
        cat.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

    return (
        <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
                <Badge key={cat} variant="outline" className="text-[10px]">
                    {formatCategory(cat)}
                </Badge>
            ))}
        </div>
    );
}

// ─── Action Confirm Dialog ─────────────────────────────────

interface ActionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    title: string;
    description: string;
    isLoading: boolean;
    variant?: "default" | "destructive";
}

function ActionConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    isLoading,
    variant = "default",
}: ActionDialogProps) {
    const [reason, setReason] = useState("");

    const handleConfirm = () => {
        onConfirm(reason);
        setReason("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <Textarea
                    placeholder="Optional reason..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="min-h-[80px]"
                />
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant={variant}
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? "Processing..." : "Confirm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Moderation Item Card ──────────────────────────────────

function ModerationItemCard({ post }: { post: ModerationPost }) {
    const [activeAction, setActiveAction] = useState<string | null>(null);
    const [approvePost, { isLoading: isApproving }] = useApprovePostMutation();
    const [removePost, { isLoading: isRemoving }] = useRemovePostMutation();
    const [warnUser, { isLoading: isWarning }] = useWarnUserFromPostMutation();
    const [escalatePost, { isLoading: isEscalating }] =
        useEscalatePostMutation();

    const isLoading = isApproving || isRemoving || isWarning || isEscalating;

    const handleAction = async (reason: string) => {
        const postId = post.id;
        try {
            switch (activeAction) {
                case "approve":
                    await approvePost({ postId, reason }).unwrap();
                    break;
                case "remove":
                    await removePost({ postId, reason }).unwrap();
                    break;
                case "warn":
                    await warnUser({ postId, reason }).unwrap();
                    break;
                case "escalate":
                    await escalatePost({ postId, reason }).unwrap();
                    break;
            }
        } catch {
            // Error handled by RTK Query
        } finally {
            setActiveAction(null);
        }
    };

    return (
        <>
            <Card className="transition-all duration-200 hover:shadow-md">
                <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-sm font-semibold truncate">
                                        {post.title}
                                    </h4>
                                    <RiskScoreBadge score={post.riskScore} />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    by {post.author.displayName} - {formatDistanceToNow(post.createdAt)}
                                </p>
                            </div>
                            <Badge variant="secondary" className="shrink-0">
                                {post.reportCount} reports
                            </Badge>
                        </div>

                        {/* Content preview */}
                        {post.content && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {post.content}
                            </p>
                        )}

                        {/* Categories */}
                        {post.categories.length > 0 && (
                            <CategoryBadges categories={post.categories} />
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t">
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"
                                onClick={() => setActiveAction("approve")}
                                disabled={isLoading}
                            >
                                <CheckCircle className="h-3.5 w-3.5" />
                                Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                onClick={() => setActiveAction("remove")}
                                disabled={isLoading}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Remove
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                onClick={() => setActiveAction("warn")}
                                disabled={isLoading}
                            >
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Warn
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                                onClick={() => setActiveAction("escalate")}
                                disabled={isLoading}
                            >
                                <ArrowUpCircle className="h-3.5 w-3.5" />
                                Escalate
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ActionConfirmDialog
                isOpen={activeAction !== null}
                onClose={() => setActiveAction(null)}
                onConfirm={handleAction}
                title={`${activeAction?.charAt(0).toUpperCase()}${activeAction?.slice(1)} Post`}
                description={`Are you sure you want to ${activeAction} this post?`}
                isLoading={isLoading}
                variant={activeAction === "remove" ? "destructive" : "default"}
            />
        </>
    );
}

// ─── Page ──────────────────────────────────────────────────

export default function ModerationPage() {
    const { user } = useAppSelector((state) => state.auth);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const { data, isLoading, isFetching } = useGetModerationQueueQuery({
        page,
        limit: 20,
        status: statusFilter !== "all" ? statusFilter : undefined,
    });

    // Role check
    if (!user || (user.role !== "MODERATOR" && user.role !== "ADMIN")) {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <EmptyState
                    icon={Shield}
                    title="Access Denied"
                    description="You do not have permission to access the moderation dashboard."
                />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        Moderation Queue
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Review and take action on flagged content
                    </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="PUBLISHED">Published</SelectItem>
                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats */}
            {data && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Flagged</CardDescription>
                            <CardTitle className="text-2xl">{data.total}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>High Risk</CardDescription>
                            <CardTitle className="text-2xl text-destructive">
                                {data.items.filter((p) => p.riskScore >= 70).length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Auto-Flagged</CardDescription>
                            <CardTitle className="text-2xl text-amber-600">
                                {data.items.filter((p) => p.isFlagged).length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            )}

            {/* Queue */}
            {isLoading ? (
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 w-full rounded-xl" />
                    ))}
                </div>
            ) : data && data.items.length > 0 ? (
                <div className="space-y-3">
                    {data.items.map((post) => (
                        <ModerationItemCard key={post.id} post={post} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={CheckCircle}
                    title="Queue is Clear"
                    description="No flagged content to review. Great job keeping the community safe!"
                />
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1 || isFetching}
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
                        disabled={page >= data.totalPages || isFetching}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
