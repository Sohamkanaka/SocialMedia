"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Plus,
    FileText,
    Globe,
    Archive,
    LayoutList,
    Pencil,
    Trash2,
    ArrowUpRight,
    Eye,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmptyState as GenericEmptyState } from "@/components/ui/empty-state";
import { PostCardSkeleton } from "@/components/ui/skeleton-patterns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PostCard } from "@/components/post/PostCard";
import { useGetUserPostsQuery } from "@/store/api/userApi";
import {
    useDeletePostMutation,
    useUpdatePostStatusMutation,
} from "@/store/api/postApi";
import { useAppSelector } from "@/store/hooks";
import { formatDistanceToNow } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";

type StatusTab = "all" | "PUBLISHED" | "DRAFT" | "ARCHIVED";

// usePageTitle is called inside the MyPostsPage component function below

const tabs: { value: StatusTab; label: string; icon: React.ElementType }[] = [
    { value: "all", label: "All Posts", icon: LayoutList },
    { value: "PUBLISHED", label: "Published", icon: Globe },
    { value: "DRAFT", label: "Drafts", icon: FileText },
    { value: "ARCHIVED", label: "Archived", icon: Archive },
];

export default function MyPostsPage() {
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);
    usePageTitle("My Posts");
    const [activeTab, setActiveTab] = useState<StatusTab>("all");

    const statusParam = activeTab === "all" ? undefined : activeTab;

    const { data, isLoading } = useGetUserPostsQuery(
        { userId: user?.id ?? "", status: statusParam },
        { skip: !user }
    );

    const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
    const [updatePostStatus] = useUpdatePostStatusMutation();

    if (!user) {
        return (
            <div className="text-center py-16">
                <p className="text-muted-foreground">
                    Please log in to view your posts.
                </p>
            </div>
        );
    }

    const handlePublish = async (postId: string) => {
        try {
            await updatePostStatus({
                id: postId,
                status: "PUBLISHED",
            }).unwrap();
        } catch {
            // Error handled by RTK Query
        }
    };

    const handleArchive = async (postId: string) => {
        try {
            await updatePostStatus({
                id: postId,
                status: "ARCHIVED",
            }).unwrap();
        } catch {
            // Error handled by RTK Query
        }
    };

    const handleDelete = async (postId: string) => {
        try {
            await deletePost(postId).unwrap();
        } catch {
            // Error handled by RTK Query
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PUBLISHED":
                return (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">
                        <Globe className="h-3 w-3 mr-1" />
                        Published
                    </Badge>
                );
            case "DRAFT":
                return (
                    <Badge variant="secondary" className="gap-1">
                        <FileText className="h-3 w-3" />
                        Draft
                    </Badge>
                );
            case "ARCHIVED":
                return (
                    <Badge variant="outline" className="text-muted-foreground gap-1">
                        <Archive className="h-3 w-3" />
                        Archived
                    </Badge>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        My Posts
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage all your posts, drafts, and archived content
                    </p>
                </div>
                <Link href="/create">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Post
                    </Button>
                </Link>
            </div>

            {/* Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as StatusTab)}
            >
                <TabsList className="w-full justify-start">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="gap-1.5"
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {/* Content — same for all tabs, data changes via query */}
                {tabs.map((tab) => (
                    <TabsContent
                        key={tab.value}
                        value={tab.value}
                        className="space-y-3 mt-4"
                    >
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <PostCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : data?.items && data.items.length > 0 ? (
                            <div className="space-y-3">
                                {data.items.map((post) => (
                                    <div
                                        key={post.id}
                                        className="rounded-xl border bg-card shadow-sm transition-all hover:shadow-md"
                                    >
                                        <div className="p-5">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {getStatusBadge(
                                                            post.status
                                                        )}
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(
                                                                post.createdAt
                                                            )}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-base font-semibold leading-snug truncate">
                                                        {post.title}
                                                    </h3>
                                                    {post.content && (
                                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                            {post.content}
                                                        </p>
                                                    )}

                                                    {/* Stats row for published */}
                                                    {post.status ===
                                                        "PUBLISHED" && (
                                                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                                <span>
                                                                    {
                                                                        post._count
                                                                            .likes
                                                                    }{" "}
                                                                    likes
                                                                </span>
                                                                <span>
                                                                    {
                                                                        post._count
                                                                            .comments
                                                                    }{" "}
                                                                    comments
                                                                </span>
                                                                <span>
                                                                    {
                                                                        post._count
                                                                            .reposts
                                                                    }{" "}
                                                                    reposts
                                                                </span>
                                                            </div>
                                                        )}
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    {post.status ===
                                                        "DRAFT" && (
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                className="gap-1.5"
                                                                onClick={() =>
                                                                    handlePublish(
                                                                        post.id
                                                                    )
                                                                }
                                                            >
                                                                <ArrowUpRight className="h-3.5 w-3.5" />
                                                                Publish
                                                            </Button>
                                                        )}
                                                    {post.status ===
                                                        "ARCHIVED" && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="gap-1.5"
                                                                onClick={() =>
                                                                    handlePublish(
                                                                        post.id
                                                                    )
                                                                }
                                                            >
                                                                <ArrowUpRight className="h-3.5 w-3.5" />
                                                                Republish
                                                            </Button>
                                                        )}
                                                    {post.status ===
                                                        "PUBLISHED" && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground"
                                                                onClick={() =>
                                                                    handleArchive(
                                                                        post.id
                                                                    )
                                                                }
                                                                title="Archive"
                                                            >
                                                                <Archive className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                        onClick={() =>
                                                            handleDelete(
                                                                post.id
                                                            )
                                                        }
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState tab={tab.value} />
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

function EmptyState({ tab }: { tab: StatusTab }) {
    const messages: Record<StatusTab, { title: string; desc: string }> = {
        all: {
            title: "No posts yet",
            desc: "Create your first post to get started.",
        },
        PUBLISHED: {
            title: "No published posts",
            desc: "Publish a draft or create a new post to share with others.",
        },
        DRAFT: {
            title: "No drafts",
            desc: "Save a post as draft to continue editing later.",
        },
        ARCHIVED: {
            title: "No archived posts",
            desc: "Posts you archive will appear here.",
        },
    };

    const { title, desc } = messages[tab];

    return (
        <GenericEmptyState
            icon={FileText}
            title={title}
            description={desc}
            action={
                (tab === "all" || tab === "PUBLISHED") && (
                    <Link href="/create">
                        <Button className="gap-2 mt-2">
                            <Plus className="h-4 w-4" />
                            Create Post
                        </Button>
                    </Link>
                )
            }
        />
    );
}
