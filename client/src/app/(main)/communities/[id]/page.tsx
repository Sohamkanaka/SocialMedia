"use client";

import { use } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/date-utils";
import { ArrowLeft, Users, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/post/PostCard";
import {
    useGetCommunityQuery,
    useGetCommunityFeedQuery,
    useGetCommunityMembersQuery,
    useJoinCommunityMutation,
    useLeaveCommunityMutation,
    useUpdateMemberRoleMutation,
} from "@/store/api/communityApi";
import { useAppSelector } from "@/store/hooks";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function CommunityDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);

    const { data: community, isLoading } = useGetCommunityQuery(id);
    const { data: feedData, isLoading: isFeedLoading } =
        useGetCommunityFeedQuery({ communityId: id });
    const { data: membersData, isLoading: isMembersLoading } =
        useGetCommunityMembersQuery({ communityId: id });

    const [joinCommunity, { isLoading: isJoining }] =
        useJoinCommunityMutation();
    const [leaveCommunity, { isLoading: isLeaving }] =
        useLeaveCommunityMutation();
    const [updateMemberRole] = useUpdateMemberRoleMutation();

    const feedPosts = feedData?.items ?? [];
    const members = membersData?.items ?? [];

    const isCreator = community?.creatorId === user?.id;
    const isModerator =
        community?.memberRole === "MODERATOR" || isCreator;

    const handleJoin = async () => {
        try {
            await joinCommunity(id).unwrap();
        } catch {
            // handled
        }
    };

    const handleLeave = async () => {
        try {
            await leaveCommunity(id).unwrap();
        } catch {
            // handled
        }
    };

    const handleRoleChange = async (
        userId: string,
        role: "MEMBER" | "MODERATOR"
    ) => {
        try {
            await updateMemberRole({
                communityId: id,
                userId,
                role,
            }).unwrap();
        } catch {
            // handled
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="grid gap-4 mt-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!community) {
        return (
            <div className="text-center py-16 space-y-4">
                <h3 className="text-lg font-semibold">Community not found</h3>
                <Link href="/communities">
                    <Button variant="outline">Back to Communities</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back button */}
            <Link href="/communities">
                <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Communities
                </Button>
            </Link>

            {/* Community Header */}
            <div className="rounded-xl border bg-card p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xl flex-shrink-0">
                            {community.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {community.name}
                            </h1>
                            {community.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {community.description}
                                </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    {community._count.members} members
                                </div>
                                <div>{community._count.posts} posts</div>
                                <div>
                                    Created by {community.creator.displayName}
                                </div>
                            </div>
                        </div>
                    </div>
                    {isAuthenticated && (
                        <div>
                            {community.isMember ? (
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">
                                        {community.memberRole === "MODERATOR"
                                            ? "Moderator"
                                            : "Member"}
                                    </Badge>
                                    {!isCreator && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleLeave}
                                            disabled={isLeaving}
                                        >
                                            {isLeaving ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                "Leave"
                                            )}
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <Button
                                    onClick={handleJoin}
                                    disabled={isJoining}
                                >
                                    {isJoining ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : null}
                                    Join Community
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs: Feed & Members */}
            <Tabs defaultValue="feed">
                <TabsList>
                    <TabsTrigger value="feed">Feed</TabsTrigger>
                    <TabsTrigger value="members">
                        Members ({community._count.members})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="feed" className="mt-4 space-y-4">
                    {isFeedLoading && (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="rounded-xl border bg-card p-5 space-y-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="space-y-1.5">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!isFeedLoading && feedPosts.length > 0 && (
                        <div className="space-y-4">
                            {feedPosts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    )}

                    {!isFeedLoading && feedPosts.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-sm text-muted-foreground">
                                No posts in this community yet.
                            </p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="members" className="mt-4">
                    {isMembersLoading && (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 p-3"
                                >
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!isMembersLoading && members.length > 0 && (
                        <div className="rounded-xl border bg-card divide-y">
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-4"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                                {member.user.displayName
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .toUpperCase()
                                                    .slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {member.user.displayName}
                                            </p>
                                            {member.user.bio && (
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {member.user.bio}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {member.userId ===
                                            community.creatorId ? (
                                            <Badge
                                                variant="default"
                                                className="gap-1"
                                            >
                                                <Shield className="h-3 w-3" />
                                                Owner
                                            </Badge>
                                        ) : isModerator ? (
                                            <Select
                                                value={member.role}
                                                onValueChange={(
                                                    value: string
                                                ) =>
                                                    handleRoleChange(
                                                        member.userId,
                                                        value as
                                                        | "MEMBER"
                                                        | "MODERATOR"
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="w-[130px] h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MEMBER">
                                                        Member
                                                    </SelectItem>
                                                    <SelectItem value="MODERATOR">
                                                        Moderator
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Badge variant="outline">
                                                {member.role === "MODERATOR"
                                                    ? "Moderator"
                                                    : "Member"}
                                            </Badge>
                                        )}
                                        <span className="text-xs text-muted-foreground hidden sm:inline">
                                            {formatDistanceToNow(member.joinedAt)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
