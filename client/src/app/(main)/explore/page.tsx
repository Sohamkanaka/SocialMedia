"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, TrendingUp, UserPlus, Hash, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserListSkeleton, PostCardSkeleton } from "@/components/ui/skeleton-patterns";
import { UserListItem } from "@/components/user/UserListItem";
import { FollowButton } from "@/components/user/FollowButton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PostCard } from "@/components/post/PostCard";
import {
    useSearchQuery,
    useGetTrendingQuery,
    useGetSuggestedUsersQuery,
} from "@/store/api/searchApi";
import { useAppSelector } from "@/store/hooks";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function ExplorePage() {
    usePageTitle("Explore");
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchType, setSearchType] = useState("all");
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    const { data: trending, isLoading: isTrendingLoading } =
        useGetTrendingQuery();
    const { data: suggested, isLoading: isSuggestedLoading } =
        useGetSuggestedUsersQuery(undefined, { skip: !isAuthenticated });
    const { data: searchResults, isLoading: isSearching } = useSearchQuery(
        { q: searchQuery, type: searchType === "all" ? undefined : searchType },
        { skip: !searchQuery }
    );

    const handleSearch = () => {
        setSearchQuery(searchInput.trim());
    };

    const handleHashtagClick = (tag: string) => {
        setSearchInput(`#${tag}`);
        setSearchQuery(`#${tag}`);
    };

    const hasSearchResults =
        searchResults &&
        ((searchResults.posts && searchResults.posts.length > 0) ||
            (searchResults.users && searchResults.users.length > 0) ||
            (searchResults.communities &&
                searchResults.communities.length > 0));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Explore</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Discover trending topics, people, and communities
                </p>
            </div>

            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search posts, users, communities..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-9"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSearch();
                        }}
                    />
                </div>
                <Select
                    value={searchType}
                    onValueChange={setSearchType}
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="posts">Posts</SelectItem>
                        <SelectItem value="users">Users</SelectItem>
                        <SelectItem value="communities">Communities</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={handleSearch} disabled={!searchInput.trim()}>
                    Search
                </Button>
            </div>

            {/* Search Results */}
            {searchQuery && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">
                        Results for &quot;{searchQuery}&quot;
                    </h2>

                    {isSearching && (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <Skeleton
                                    key={i}
                                    className="h-20 w-full rounded-xl"
                                />
                            ))}
                        </div>
                    )}

                    {!isSearching && !hasSearchResults && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No results found. Try a different search term.
                        </p>
                    )}

                    {/* Post results */}
                    {searchResults?.posts && searchResults.posts.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Posts
                            </h3>
                            <div className="space-y-3">
                                {searchResults.posts.map((post) => (
                                    <PostCard key={post.id} post={post} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* User results */}
                    {searchResults?.users && searchResults.users.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Users
                            </h3>
                            <div className="rounded-xl border bg-card divide-y">
                                {searchResults.users.map((searchUser) => (
                                    <div key={searchUser.id} className="p-4">
                                        <UserListItem
                                            user={searchUser}
                                            meta={
                                                <p className="text-xs text-muted-foreground">
                                                    {searchUser._count.followers} followers
                                                </p>
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Community results */}
                    {searchResults?.communities &&
                        searchResults.communities.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                    Communities
                                </h3>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {searchResults.communities.map(
                                        (community) => (
                                            <Link
                                                key={community.id}
                                                href={`/communities/${community.id}`}
                                            >
                                                <Card className="hover:shadow-md transition-shadow">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-base">
                                                            {community.name}
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="text-sm text-muted-foreground">
                                                        <p>
                                                            {
                                                                community._count
                                                                    .members
                                                            }{" "}
                                                            members /{" "}
                                                            {
                                                                community._count
                                                                    .posts
                                                            }{" "}
                                                            posts
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                </div>
            )}

            {/* Trending & Suggested (shown when no search is active) */}
            {!searchQuery && (
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Trending Hashtags */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingUp className="h-4 w-4" />
                                Trending Hashtags
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isTrendingLoading && (
                                <div className="flex flex-wrap gap-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Skeleton
                                            key={i}
                                            className="h-7 w-20 rounded-full"
                                        />
                                    ))}
                                </div>
                            )}

                            {!isTrendingLoading &&
                                trending &&
                                trending.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {trending.map((hashtag) => (
                                            <button
                                                key={hashtag.tag}
                                                onClick={() =>
                                                    handleHashtagClick(
                                                        hashtag.tag
                                                    )
                                                }
                                                className="inline-flex items-center gap-1.5"
                                            >
                                                <Badge
                                                    variant="secondary"
                                                    className="cursor-pointer hover:bg-secondary/80 transition-colors gap-1"
                                                >
                                                    <Hash className="h-3 w-3" />
                                                    {hashtag.tag}
                                                    <span className="text-muted-foreground ml-1">
                                                        {hashtag.count}
                                                    </span>
                                                </Badge>
                                            </button>
                                        ))}
                                    </div>
                                )}

                            {!isTrendingLoading &&
                                (!trending || trending.length === 0) && (
                                    <p className="text-sm text-muted-foreground">
                                        No trending hashtags yet. Use #hashtags
                                        in your posts!
                                    </p>
                                )}
                        </CardContent>
                    </Card>

                    {/* Suggested Users */}
                    {isAuthenticated && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <UserPlus className="h-4 w-4" />
                                    Suggested Users
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isSuggestedLoading && (
                                    <UserListSkeleton count={3} />
                                )}

                                {!isSuggestedLoading &&
                                    suggested &&
                                    suggested.length > 0 && (
                                        <div className="space-y-3">
                                            {suggested
                                                .slice(0, 6)
                                                .map((suggestedUser) => (
                                                    <UserListItem
                                                        key={suggestedUser.id}
                                                        user={suggestedUser}
                                                        action={
                                                            <FollowButton
                                                                userId={suggestedUser.id}
                                                                isFollowing={suggestedUser.isFollowing}
                                                            />
                                                        }
                                                        meta={
                                                            <p className="text-xs text-muted-foreground">
                                                                {
                                                                    suggestedUser
                                                                        ._count
                                                                        .followers
                                                                }{" "}
                                                                followers
                                                            </p>
                                                        }
                                                    />
                                                ))}
                                        </div>
                                    )}

                                {!isSuggestedLoading &&
                                    (!suggested ||
                                        suggested.length === 0) && (
                                        <p className="text-sm text-muted-foreground">
                                            No suggestions right now. Check back
                                            later!
                                        </p>
                                    )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
