import { prisma } from "../lib/prisma.js";
import { attachInteractions } from "./post.repo.js";

// ─── User Repository ──────────────────────────────────────
// All direct Prisma calls for users/profiles live here.

// ─── Find by ID (profile with stats) ──────────────────────

export const findById = async (id: string) => {
    return prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
            avatar: true,
            bio: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: {
                    posts: true,
                    followers: true,
                    following: true,
                },
            },
        },
    });
};

// ─── Update Profile ────────────────────────────────────────

export const updateProfile = async (
    id: string,
    data: { displayName?: string; bio?: string | null; avatar?: string | null }
) => {
    return prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
            avatar: true,
            bio: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: {
                    posts: true,
                    followers: true,
                    following: true,
                },
            },
        },
    });
};

// ─── Follow / Unfollow ─────────────────────────────────────

export const follow = async (followerId: string, followingId: string) => {
    return prisma.follow.create({
        data: { followerId, followingId },
    });
};

export const unfollow = async (followerId: string, followingId: string) => {
    return prisma.follow.delete({
        where: {
            followerId_followingId: { followerId, followingId },
        },
    });
};

export const findFollow = async (followerId: string, followingId: string) => {
    return prisma.follow.findUnique({
        where: {
            followerId_followingId: { followerId, followingId },
        },
    });
};

// ─── Get Followers (paginated) ─────────────────────────────

export const getFollowers = async (
    userId: string,
    viewerId?: string,
    cursor?: string,
    limit: number = 20
) => {
    const follows = await prisma.follow.findMany({
        where: { followingId: userId },
        include: {
            follower: {
                select: {
                    id: true,
                    displayName: true,
                    avatar: true,
                    bio: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
        }),
    });

    const hasMore = follows.length > limit;
    const items = hasMore ? follows.slice(0, limit) : follows;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    const usersWithFollowing = await attachFollowingStatus(
        viewerId,
        items.map((f) => f.follower)
    );

    return {
        items: usersWithFollowing,
        nextCursor,
        hasMore,
    };
};

// ─── Get Following (paginated) ─────────────────────────────

export const getFollowing = async (
    userId: string,
    viewerId?: string,
    cursor?: string,
    limit: number = 20
) => {
    const follows = await prisma.follow.findMany({
        where: { followerId: userId },
        include: {
            following: {
                select: {
                    id: true,
                    displayName: true,
                    avatar: true,
                    bio: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
        }),
    });

    const hasMore = follows.length > limit;
    const items = hasMore ? follows.slice(0, limit) : follows;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    const usersWithFollowing = await attachFollowingStatus(
        viewerId,
        items.map((f) => f.following)
    );

    return {
        items: usersWithFollowing,
        nextCursor,
        hasMore,
    };
};

// ─── Get User Bookmarks (paginated) ───────────────────────

export const getBookmarks = async (
    userId: string,
    cursor?: string,
    limit: number = 10
) => {
    const bookmarks = await prisma.bookmark.findMany({
        where: { userId },
        include: {
            post: {
                include: {
                    author: {
                        select: {
                            id: true,
                            displayName: true,
                            avatar: true,
                            role: true,
                        },
                    },
                    community: { select: { id: true, name: true, slug: true } },
                    pollOptions: {
                        select: { id: true, text: true, votesCount: true },
                    },
                    _count: {
                        select: {
                            comments: true,
                            likes: true,
                            bookmarks: true,
                            reposts: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
        }),
    });

    const hasMore = bookmarks.length > limit;
    const items = hasMore ? bookmarks.slice(0, limit) : bookmarks;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    const postsWithInteractions = await attachInteractions(userId, items.map((b) => b.post));

    return {
        items: postsWithInteractions,
        nextCursor,
        hasMore,
    };
};

// ─── Shared Helper to attach following status ─────────────────────

export const attachFollowingStatus = async <T extends { id: string }>(
    viewerId: string | undefined,
    users: T[]
) => {
    if (!viewerId || users.length === 0) {
        return users.map((u) => ({ ...u, isFollowing: false }));
    }

    const userIds = users.map((u) => u.id);

    const following = await prisma.follow.findMany({
        where: { followerId: viewerId, followingId: { in: userIds } },
        select: { followingId: true },
    });

    const followingSet = new Set(following.map((f) => f.followingId));

    return users.map((u) => ({
        ...u,
        isFollowing: followingSet.has(u.id),
    }));
};
