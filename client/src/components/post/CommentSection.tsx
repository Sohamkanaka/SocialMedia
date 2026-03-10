"use client";

import { useState, useCallback } from "react";
import { formatDate } from "@/lib/date-utils";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    useGetCommentsQuery,
    useAddCommentMutation,
} from "@/store/api/commentApi";
import type { Comment } from "@/store/api/commentApi";
import { useAppSelector } from "@/store/hooks";
import { getInitials } from "@/lib/utils";

interface CommentSectionProps {
    postId: string;
}

/** Renders a single comment with optional nested replies. */
function CommentItem({ comment }: { comment: Comment }) {
    return (
        <div className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {getInitials(comment.author.displayName)}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                        {comment.author.displayName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                    </span>
                </div>
                <p className="text-sm text-foreground/90 mt-1">
                    {comment.content}
                </p>

                {/* Nested replies */}
                {comment.children && comment.children.length > 0 && (
                    <div className="mt-3 space-y-3 pl-4 border-l-2 border-muted">
                        {comment.children.map((child) => (
                            <CommentItem key={child.id} comment={child} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/** Comment section with list and add comment form. */
export function CommentSection({ postId }: CommentSectionProps) {
    const [content, setContent] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    const { data, isLoading } = useGetCommentsQuery(
        { postId },
        { skip: !isExpanded }
    );
    const [addComment, { isLoading: isAdding }] = useAddCommentMutation();

    const handleSubmit = useCallback(async () => {
        if (!content.trim()) return;

        try {
            await addComment({ postId, content: content.trim() }).unwrap();
            setContent("");
        } catch {
            // Error handled by RTK Query
        }
    }, [addComment, content, postId]);

    const comments = data?.items ?? [];

    return (
        <div className="space-y-4">
            {/* Toggle button */}
            <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <MessageCircle className="h-4 w-4" />
                {isExpanded ? "Hide Comments" : "Show Comments"}
            </Button>

            {isExpanded && (
                <div className="space-y-4 pl-2">
                    {/* Add comment form */}
                    {isAuthenticated && (
                        <div className="flex gap-3">
                            <Textarea
                                placeholder="Write a comment..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="min-h-[60px] resize-none text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit();
                                    }
                                }}
                            />
                            <Button
                                size="icon"
                                className="flex-shrink-0 h-10 w-10"
                                disabled={!content.trim() || isAdding}
                                onClick={handleSubmit}
                            >
                                {isAdding ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Loading skeleton */}
                    {isLoading && (
                        <div className="space-y-3">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex gap-3">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <div className="space-y-1.5 flex-1">
                                        <Skeleton className="h-3 w-24" />
                                        <Skeleton className="h-3 w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Comments list */}
                    {!isLoading && comments.length > 0 && (
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                />
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && comments.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No comments yet. Be the first to comment.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
