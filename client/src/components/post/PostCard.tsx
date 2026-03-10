"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { formatDistanceToNow } from "@/lib/date-utils";
import {
    Heart,
    MessageCircle,
    Repeat2,
    Bookmark,
    MoreHorizontal,
    Flag,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import {
    useLikePostMutation,
    useUnlikePostMutation,
    useBookmarkPostMutation,
    useUnbookmarkPostMutation,
    useRepostPostMutation,
    useUnrepostPostMutation,
} from "@/store/api/postApi";
import type { Post } from "@/store/api/postApi";
import { useAppSelector } from "@/store/hooks";
import { cn, getInitials } from "@/lib/utils";
import { ReportDialog } from "./report-dialog";

const CommentSection = dynamic(
    () =>
        import("./CommentSection").then((mod) => ({
            default: mod.CommentSection,
        })),
    { loading: () => <Skeleton className="h-10 w-full" /> }
);

interface PostCardProps {
    post: Post;
}

export const PostCard = React.memo(function PostCard({ post }: PostCardProps) {
    const { user } = useAppSelector((state) => state.auth);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isLiked, setIsLiked] = useState(post.interactions?.isLiked ?? false);
    const [isBookmarked, setIsBookmarked] = useState(
        post.interactions?.isBookmarked ?? false
    );
    const [isReposted, setIsReposted] = useState(
        post.interactions?.isReposted ?? false
    );
    const [likesCount, setLikesCount] = useState(post._count.likes);
    const [repostsCount, setRepostsCount] = useState(post._count.reposts);

    React.useEffect(() => {
        setIsLiked(post.interactions?.isLiked ?? false);
        setIsBookmarked(post.interactions?.isBookmarked ?? false);
        setIsReposted(post.interactions?.isReposted ?? false);
        setLikesCount(post._count.likes);
        setRepostsCount(post._count.reposts);
    }, [
        post.interactions?.isLiked,
        post.interactions?.isBookmarked,
        post.interactions?.isReposted,
        post._count.likes,
        post._count.reposts,
    ]);

    const [likePost] = useLikePostMutation();
    const [unlikePost] = useUnlikePostMutation();
    const [bookmarkPost] = useBookmarkPostMutation();
    const [unbookmarkPost] = useUnbookmarkPostMutation();
    const [repostPost] = useRepostPostMutation();
    const [unrepostPost] = useUnrepostPostMutation();

    const initials = getInitials(post.author.displayName);

    const handleLike = async () => {
        if (!user) return;
        try {
            if (isLiked) {
                setIsLiked(false);
                setLikesCount((prev) => prev - 1);
                await unlikePost(post.id).unwrap();
            } else {
                setIsLiked(true);
                setLikesCount((prev) => prev + 1);
                await likePost(post.id).unwrap();
            }
        } catch {
            setIsLiked(!isLiked);
            setLikesCount(post._count.likes);
        }
    };

    const handleBookmark = async () => {
        if (!user) return;
        try {
            if (isBookmarked) {
                setIsBookmarked(false);
                await unbookmarkPost(post.id).unwrap();
            } else {
                setIsBookmarked(true);
                await bookmarkPost(post.id).unwrap();
            }
        } catch {
            setIsBookmarked(!isBookmarked);
        }
    };

    const handleRepost = async () => {
        if (!user || post.authorId === user.id) return;
        try {
            if (isReposted) {
                setIsReposted(false);
                setRepostsCount((prev) => prev - 1);
                await unrepostPost(post.id).unwrap();
            } else {
                setIsReposted(true);
                setRepostsCount((prev) => prev + 1);
                await repostPost(post.id).unwrap();
            }
        } catch {
            setIsReposted(!isReposted);
            setRepostsCount(post._count.reposts);
        }
    };

    return (
        <article className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-md hover:border-border/80">
            {post.repostedBy && (
                <div className="flex items-center gap-2 px-5 pt-3 pb-1 text-xs font-medium text-muted-foreground">
                    <Repeat2 className="h-3.5 w-3.5" />
                    <span>
                        <Link href={`/profile/${post.repostedBy.id}`} className="hover:underline hover:text-foreground transition-colors">
                            {post.repostedBy.displayName}
                        </Link>{" "}
                        reposted
                    </span>
                </div>
            )}
            <div className={cn("px-5 pb-5", !post.repostedBy && "pt-5")}>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link href={`/profile/${post.authorId}`}>
                            <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all">
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs font-semibold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/profile/${post.authorId}`}
                                    className="text-sm font-semibold hover:underline"
                                >
                                    {post.author.displayName}
                                </Link>
                                {post.community && (
                                    <Badge
                                        variant="secondary"
                                        className="text-xs font-normal"
                                    >
                                        {post.community.name}
                                    </Badge>
                                )}
                                {post.status === "DRAFT" && (
                                    <Badge variant="outline" className="text-xs">
                                        Draft
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(post.createdAt)}
                            </p>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setIsReportOpen(true)}
                            >
                                <Flag className="h-4 w-4 mr-2" />
                                Report
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Content */}
                <div className="mt-4 space-y-2.5">
                    <h3 className="text-base font-semibold leading-snug">
                        {post.title}
                    </h3>
                    {post.content && (
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {post.content}
                        </p>
                    )}
                </div>

                {/* Media */}
                {post.mediaUrl && (post.type === "IMAGE" || post.type === "VIDEO") && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-border/50 bg-muted/20">
                        {post.type === "IMAGE" ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={post.mediaUrl}
                                alt={post.title}
                                className="w-full max-h-96 object-cover"
                            />
                        ) : (
                            <video
                                src={post.mediaUrl}
                                controls
                                className="w-full max-h-96"
                            />
                        )}
                    </div>
                )}

                {/* Poll Options */}
                {post.type === "POLL" && post.pollOptions.length > 0 && (
                    <PollDisplay pollOptions={post.pollOptions} />
                )}

                {/* Action Bar */}
                <div className="mt-5 flex items-center gap-2 -ml-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "gap-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 active:scale-95 transition-all",
                                    isLiked && "text-rose-500 bg-rose-500/5"
                                )}
                                onClick={handleLike}
                            >
                                <Heart
                                    className={cn(
                                        "h-4 w-4",
                                        isLiked && "fill-current"
                                    )}
                                />
                                <span className="text-xs">{likesCount || ""}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {isLiked ? "Unlike" : "Like"}
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-500 active:scale-95 transition-all"
                            >
                                <MessageCircle className="h-4 w-4" />
                                <span className="text-xs">
                                    {post._count.comments || ""}
                                </span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Comment</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "gap-1.5 text-muted-foreground hover:bg-green-500/10 hover:text-green-500 active:scale-95 transition-all",
                                    isReposted && "text-green-500 bg-green-500/5"
                                )}
                                onClick={handleRepost}
                            >
                                <Repeat2
                                    className={cn(
                                        "h-4 w-4",
                                        isReposted && "stroke-[2.5]"
                                    )}
                                />
                                <span className="text-xs">
                                    {repostsCount || ""}
                                </span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {isReposted ? "Undo repost" : "Repost"}
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "gap-1.5 text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500 active:scale-95 transition-all",
                                    isBookmarked && "text-amber-500 bg-amber-500/5"
                                )}
                                onClick={handleBookmark}
                            >
                                <Bookmark
                                    className={cn(
                                        "h-4 w-4",
                                        isBookmarked && "fill-current"
                                    )}
                                />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {isBookmarked ? "Remove bookmark" : "Bookmark"}
                        </TooltipContent>
                    </Tooltip>
                </div>

                {/* Comments Section */}
                {post.status === "PUBLISHED" && (
                    <div className="mt-3 border-t pt-3">
                        <CommentSection postId={post.id} />
                    </div>
                )}
            </div>

            {/* Report Dialog */}
            <ReportDialog
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                targetType="POST"
                targetId={post.id}
            />
        </article>
    );
});

/** Extracted poll display to memoize totalVotes. */
import type { PollOption } from "@/store/api/postApi";

function PollDisplay({ pollOptions }: { pollOptions: PollOption[] }) {
    const totalVotes = useMemo(
        () => pollOptions.reduce((sum, opt) => sum + opt.votesCount, 0),
        [pollOptions]
    );

    return (
        <div className="mt-3 space-y-2">
            {pollOptions.map((option) => {
                const percentage =
                    totalVotes > 0
                        ? Math.round((option.votesCount / totalVotes) * 100)
                        : 0;

                return (
                    <div
                        key={option.id}
                        className="relative rounded-lg border p-3 overflow-hidden"
                    >
                        <div
                            className="absolute inset-0 bg-primary/10 transition-all"
                            style={{ width: `${percentage}%` }}
                        />
                        <div className="relative flex items-center justify-between">
                            <span className="text-sm font-medium">
                                {option.text}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">
                                {percentage}%
                            </span>
                        </div>
                    </div>
                );
            })}
            <p className="text-xs text-muted-foreground">
                {totalVotes} votes
            </p>
        </div>
    );
}
