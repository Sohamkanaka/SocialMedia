"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Users, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { CommunityCardSkeleton } from "@/components/ui/skeleton-patterns";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    useGetCommunitiesQuery,
    useCreateCommunityMutation,
    useJoinCommunityMutation,
    useLeaveCommunityMutation,
} from "@/store/api/communityApi";
import { useAppSelector } from "@/store/hooks";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function CommunitiesPage() {
    usePageTitle("Communities");
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    const { data, isLoading } = useGetCommunitiesQuery();
    const [createCommunity, { isLoading: isCreating }] =
        useCreateCommunityMutation();
    const [joinCommunity] = useJoinCommunityMutation();
    const [leaveCommunity] = useLeaveCommunityMutation();

    const communities = data?.items ?? [];
    const filteredCommunities = searchQuery
        ? communities.filter(
            (c) =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.description
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase())
        )
        : communities;

    const handleCreate = async () => {
        if (!newName.trim()) return;

        try {
            await createCommunity({
                name: newName.trim(),
                description: newDescription.trim() || undefined,
            }).unwrap();
            setNewName("");
            setNewDescription("");
            setIsCreateOpen(false);
        } catch {
            // Error handled by RTK Query
        }
    };

    const handleJoin = async (id: string) => {
        try {
            await joinCommunity(id).unwrap();
        } catch {
            // handled
        }
    };

    const handleLeave = async (id: string) => {
        try {
            await leaveCommunity(id).unwrap();
        } catch {
            // handled
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Communities
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Discover and join communities
                    </p>
                </div>
                {isAuthenticated && (
                    <Dialog
                        open={isCreateOpen}
                        onOpenChange={setIsCreateOpen}
                    >
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create Community
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Community</DialogTitle>
                                <DialogDescription>
                                    Start a new community around a shared
                                    interest or topic.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="community-name">Name</Label>
                                    <Input
                                        id="community-name"
                                        placeholder="e.g. React Developers"
                                        value={newName}
                                        onChange={(e) =>
                                            setNewName(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="community-description">
                                        Description (optional)
                                    </Label>
                                    <Textarea
                                        id="community-description"
                                        placeholder="What is this community about?"
                                        value={newDescription}
                                        onChange={(e) =>
                                            setNewDescription(e.target.value)
                                        }
                                        className="resize-none"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCreateOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreate}
                                    disabled={!newName.trim() || isCreating}
                                >
                                    {isCreating ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : null}
                                    Create
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search communities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Loading Skeleton */}
            {isLoading && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <CommunityCardSkeleton count={6} />
                </div>
            )}

            {/* Communities Grid */}
            {!isLoading && filteredCommunities.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredCommunities.map((community) => (
                        <Card
                            key={community.id}
                            className="flex flex-col hover:shadow-md transition-shadow"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                                        {community.name
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <CardTitle className="text-base truncate">
                                            <Link
                                                href={`/communities/${community.id}`}
                                                className="hover:underline"
                                            >
                                                {community.name}
                                            </Link>
                                        </CardTitle>
                                    </div>
                                </div>
                                {community.description && (
                                    <CardDescription className="line-clamp-2 mt-2">
                                        {community.description}
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className="flex-1 pb-3">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-3.5 w-3.5" />
                                        {community._count.members} members
                                    </div>
                                    <div>
                                        {community._count.posts} posts
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                    <Avatar className="h-5 w-5">
                                        <AvatarFallback className="text-[10px] bg-muted">
                                            {community.creator.displayName
                                                .charAt(0)
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground">
                                        Created by{" "}
                                        {community.creator.displayName}
                                    </span>
                                </div>
                            </CardContent>
                            {isAuthenticated && (
                                <CardFooter className="pt-0">
                                    {community.isMember ? (
                                        <div className="flex items-center gap-2 w-full">
                                            <Badge variant="secondary">
                                                Member
                                            </Badge>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="ml-auto"
                                                onClick={() =>
                                                    handleLeave(community.id)
                                                }
                                            >
                                                Leave
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            size="sm"
                                            className="w-full"
                                            onClick={() =>
                                                handleJoin(community.id)
                                            }
                                        >
                                            Join Community
                                        </Button>
                                    )}
                                </CardFooter>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredCommunities.length === 0 && (
                <EmptyState
                    icon={Users}
                    title={searchQuery ? "No communities found" : "No communities yet"}
                    description={searchQuery ? "Try a different search term." : "Be the first to create a community."}
                />
            )}
        </div>
    );
}
