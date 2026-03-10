"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
    Calendar,
    MapPin,
    UserPlus,
    UserMinus,
    Loader2,
    Edit3,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCardSkeleton } from "@/components/ui/skeleton-patterns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PostCard } from "@/components/post/PostCard";
import { FollowButton } from "@/components/user/FollowButton";
import {
    useGetProfileQuery,
    useGetUserPostsQuery,
    useUpdateProfileMutation,
    useGetFollowersQuery,
    useGetFollowingQuery,
    useGetBookmarksQuery,
} from "@/store/api/userApi";
import { useAppSelector } from "@/store/hooks";
import { formatDate } from "@/lib/date-utils";
import { cn, getInitials } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";
import Link from "next/link";

export default function ProfilePage() {
    const params = useParams();
    const userId = params.id as string;
    const { user: currentUser } = useAppSelector((state) => state.auth);
    const isOwnProfile = currentUser?.id === userId;

    const { data: profile, isLoading: isProfileLoading } =
        useGetProfileQuery(userId);
    usePageTitle(profile?.displayName ? `${profile.displayName}'s Profile` : "Profile");
    const { data: postsData, isLoading: isPostsLoading } =
        useGetUserPostsQuery({ userId });
    const { data: followersData } = useGetFollowersQuery({ userId });
    const { data: followingData } = useGetFollowingQuery({ userId });
    const { data: bookmarksData } = useGetBookmarksQuery(
        {},
        { skip: !isOwnProfile }
    );

    const [updateProfile, { isLoading: isUpdating }] =
        useUpdateProfileMutation();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editDisplayName, setEditDisplayName] = useState("");
    const [editBio, setEditBio] = useState("");

    const handleEditProfile = async () => {
        try {
            await updateProfile({
                displayName: editDisplayName || undefined,
                bio: editBio || null,
            }).unwrap();
            setIsEditOpen(false);
        } catch {
            // Error handled by RTK Query
        }
    };

    const openEditModal = () => {
        if (profile) {
            setEditDisplayName(profile.displayName);
            setEditBio(profile.bio || "");
        }
        setIsEditOpen(true);
    };

    if (isProfileLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-start gap-6">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-16">
                <h2 className="text-xl font-semibold">User not found</h2>
                <p className="text-muted-foreground mt-1">
                    This profile does not exist.
                </p>
            </div>
        );
    }

    const initials = getInitials(profile.displayName);

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="rounded-xl border bg-card p-6">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                    <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-xl font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h1 className="text-xl font-bold">
                                    {profile.displayName}
                                </h1>
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Joined {formatDate(profile.createdAt)}
                                </p>
                            </div>

                            {isOwnProfile ? (
                                <Dialog
                                    open={isEditOpen}
                                    onOpenChange={setIsEditOpen}
                                >
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                            onClick={openEditModal}
                                        >
                                            <Edit3 className="h-4 w-4" />
                                            Edit Profile
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                Edit Profile
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 mt-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-name">
                                                    Display Name
                                                </Label>
                                                <Input
                                                    id="edit-name"
                                                    value={editDisplayName}
                                                    onChange={(e) =>
                                                        setEditDisplayName(
                                                            e.target.value
                                                        )
                                                    }
                                                    maxLength={50}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-bio">
                                                    Bio
                                                </Label>
                                                <Textarea
                                                    id="edit-bio"
                                                    value={editBio}
                                                    onChange={(e) =>
                                                        setEditBio(
                                                            e.target.value
                                                        )
                                                    }
                                                    rows={4}
                                                    maxLength={500}
                                                    placeholder="Tell us about yourself..."
                                                    className="resize-none"
                                                />
                                                <p className="text-xs text-muted-foreground text-right">
                                                    {editBio.length}/500
                                                </p>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        setIsEditOpen(false)
                                                    }
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleEditProfile}
                                                    disabled={isUpdating}
                                                >
                                                    {isUpdating ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    ) : null}
                                                    Save Changes
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            ) : (
                                <FollowButton
                                    userId={profile.id}
                                    isFollowing={profile.isFollowing}
                                />
                            )}
                        </div>

                        {profile.bio && (
                            <p className="text-sm mt-3 leading-relaxed">
                                {profile.bio}
                            </p>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-5 mt-4">
                            <div className="text-center">
                                <p className="text-lg font-bold">
                                    {profile._count.posts}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Posts
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold">
                                    {profile._count.followers}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Followers
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold">
                                    {profile._count.following}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Following
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="posts" className="space-y-4">
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="posts">Posts</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                    {isOwnProfile && (
                        <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
                    )}
                    <TabsTrigger value="followers">Followers</TabsTrigger>
                    <TabsTrigger value="following">Following</TabsTrigger>
                </TabsList>

                {/* Posts Tab */}
                <TabsContent value="posts" className="space-y-4">
                    {isPostsLoading ? (
                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <PostCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : postsData?.items && postsData.items.length > 0 ? (
                        postsData.items.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                No posts yet.
                            </p>
                        </div>
                    )}
                </TabsContent>

                {/* Media Tab */}
                <TabsContent value="media">
                    {postsData?.items?.filter(
                        (p) => p.type === "IMAGE" || p.type === "VIDEO"
                    ).length ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {postsData.items
                                .filter(
                                    (p) =>
                                        p.type === "IMAGE" ||
                                        p.type === "VIDEO"
                                )
                                .map((post) => (
                                    <div
                                        key={post.id}
                                        className="aspect-square rounded-lg border overflow-hidden"
                                    >
                                        {post.mediaUrl && (
                                            <Image
                                                src={post.mediaUrl}
                                                alt={post.title}
                                                width={400}
                                                height={400}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            />
                                        )}
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                No media posts yet.
                            </p>
                        </div>
                    )}
                </TabsContent>

                {/* Bookmarks Tab (own profile only) */}
                {isOwnProfile && (
                    <TabsContent value="bookmarks" className="space-y-4">
                        {bookmarksData?.items &&
                            bookmarksData.items.length > 0 ? (
                            bookmarksData.items.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">
                                    No bookmarks yet.
                                </p>
                            </div>
                        )}
                    </TabsContent>
                )}

                {/* Followers Tab */}
                <TabsContent value="followers">
                    {followersData?.items && followersData.items.length > 0 ? (
                        <div className="space-y-3">
                            {followersData.items.map((follower) => (
                                <Link
                                    key={follower.id}
                                    href={`/profile/${follower.id}`}
                                    className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                            {getInitials(follower.displayName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate">
                                            {follower.displayName}
                                        </p>
                                        {follower.bio && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                {follower.bio}
                                            </p>
                                        )}
                                    </div>
                                    <div className="ml-auto pointer-events-auto" onClick={(e) => e.preventDefault()}>
                                        <FollowButton
                                            userId={follower.id}
                                            isFollowing={follower.isFollowing}
                                        />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                No followers yet.
                            </p>
                        </div>
                    )}
                </TabsContent>

                {/* Following Tab */}
                <TabsContent value="following">
                    {followingData?.items && followingData.items.length > 0 ? (
                        <div className="space-y-3">
                            {followingData.items.map((following) => (
                                <Link
                                    key={following.id}
                                    href={`/profile/${following.id}`}
                                    className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                            {getInitials(following.displayName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate">
                                            {following.displayName}
                                        </p>
                                        {following.bio && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                {following.bio}
                                            </p>
                                        )}
                                    </div>
                                    <div className="ml-auto pointer-events-auto" onClick={(e) => e.preventDefault()}>
                                        <FollowButton
                                            userId={following.id}
                                            isFollowing={following.isFollowing}
                                        />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                Not following anyone yet.
                            </p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
