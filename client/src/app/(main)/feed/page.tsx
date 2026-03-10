"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PostCardSkeleton } from "@/components/ui/skeleton-patterns";
import { PostCard } from "@/components/post/PostCard";
import { useGetFeedQuery } from "@/store/api/postApi";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function FeedPage() {
    usePageTitle("Feed");
    const [cursor, setCursor] = useState<string | undefined>(undefined);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const { data, isLoading, isFetching } = useGetFeedQuery({
        cursor,
        limit: 10,
    });

    const posts = data?.items ?? [];
    const hasMore = data?.hasMore ?? false;

    const handleLoadMore = useCallback(() => {
        if (data?.nextCursor && !isFetching) {
            setCursor(data.nextCursor);
        }
    }, [data?.nextCursor, isFetching]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const target = loadMoreRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isFetching) {
                    handleLoadMore();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, [hasMore, isFetching, handleLoadMore]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Feed</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Latest posts from people you follow
                    </p>
                </div>
                <Link href="/create">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Post
                    </Button>
                </Link>
            </div>

            {/* Loading Skeleton */}
            {isLoading && (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <PostCardSkeleton key={i} />
                    ))}
                </div>
            )}

            {/* Posts */}
            {!isLoading && posts.length > 0 && (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && posts.length === 0 && (
                <EmptyState
                    icon={Plus}
                    title="No posts yet"
                    description="Follow others or create your first post to get started."
                    action={
                        <Link href="/create">
                            <Button className="mt-2">Create your first post</Button>
                        </Link>
                    }
                />
            )}

            {/* Load More Trigger / Spinner */}
            {hasMore && (
                <div ref={loadMoreRef} className="flex justify-center py-4">
                    {isFetching && (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    )}
                </div>
            )}

            {/* End of Feed */}
            {!isLoading && posts.length > 0 && !hasMore && (
                <p className="text-center text-sm text-muted-foreground py-4">
                    You have reached the end of your feed.
                </p>
            )}
        </div>
    );
}
