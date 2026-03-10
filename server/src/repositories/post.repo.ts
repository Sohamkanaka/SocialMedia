import { prisma } from "../lib/prisma.js";
import type { PostType, PostStatus } from "@prisma/client/index";
import { postInclude } from "./shared.js";

// ─── Post Repository ──────────────────────────────────────
// All direct Prisma calls for posts live here.

// ─── Create ────────────────────────────────────────────────

export const create = async (data: {
    title: string;
    content?: string;
    type: string;
    status: string;
    mediaUrl?: string;
    authorId: string;
    communityId?: string;
    scheduledAt?: string;
    pollOptions?: { text: string }[];
}) => {
    const { pollOptions, scheduledAt, type, status, ...postData } = data;

    return prisma.post.create({
        data: {
            ...postData,
            type: type as PostType,
            status: status as PostStatus,
            publishedAt: status === "PUBLISHED" ? new Date() : null,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            ...(pollOptions && {
                pollOptions: {
                    create: pollOptions.map((opt) => ({ text: opt.text })),
                },
            }),
        },
        include: postInclude,
    });
};

// ─── Find By ID ────────────────────────────────────────────

export const findById = async (id: string) => {
    return prisma.post.findUnique({
        where: { id },
        include: postInclude,
    });
};

// ─── Find Feed (paginated, from followed users) ───────────

export const findFeed = async (
    userId: string,
    cursor?: string,
    limit: number = 10
) => {
    // Get IDs of users the current user follows
    const following = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);
    // Include own posts in feed
    followingIds.push(userId);

    const cursorDate = cursor ? new Date(cursor) : undefined;

    // 1. Fetch original posts
    const originalPosts = await prisma.post.findMany({
        where: {
            authorId: { in: followingIds },
            status: "PUBLISHED",
            ...(cursorDate && {
                createdAt: { lt: cursorDate },
            }),
        },
        include: postInclude,
        orderBy: { createdAt: "desc" },
        take: limit + 1,
    });

    // 2. Fetch reposts
    const reposts = await prisma.repost.findMany({
        where: {
            userId: { in: followingIds },
            ...(cursorDate && {
                createdAt: { lt: cursorDate },
            }),
        },
        include: {
            user: { select: { id: true, displayName: true } },
            post: { include: postInclude },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
    });

    // Filter out reposts of unpublished/deleted posts
    const validReposts = reposts.filter((r) => r.post && r.post.status === "PUBLISHED");

    // 3. Map reposts to the generic Post shape, injecting the `repostedBy` tag
    const mappedReposts = validReposts.map((r) => ({
        ...r.post,
        repostedBy: r.user,
        // Override the feed sorting timestamp with the repost timestamp
        feedTimestamp: r.createdAt.getTime(),
    }));

    const mappedOriginals = originalPosts.map((p) => ({
        ...p,
        repostedBy: null,
        feedTimestamp: p.createdAt.getTime(),
    }));

    // 4. Merge, sort, and paginate
    const combined = [...mappedOriginals, ...mappedReposts].sort(
        (a, b) => b.feedTimestamp - a.feedTimestamp
    );

    const hasMore = combined.length > limit;
    const items = hasMore ? combined.slice(0, limit) : combined;
    const nextCursor = hasMore ? new Date(items[items.length - 1].feedTimestamp).toISOString() : null;

    // Remove the temporary feedTimestamp property before attaching interactions
    const cleanedItems = items.map(({ feedTimestamp, ...post }) => post);

    const itemsWithInteractions = await attachInteractions(userId, cleanedItems);

    return { items: itemsWithInteractions, nextCursor, hasMore };
};

// ─── Find User Posts (paginated) ───────────────────────────

export const findByUserId = async (
    userId: string,
    viewerId: string | undefined,
    cursor?: string,
    limit: number = 10,
    status?: string
) => {
    const cursorDate = cursor ? new Date(cursor) : undefined;

    // 1. Fetch original authored posts
    const originalPosts = await prisma.post.findMany({
        where: {
            authorId: userId,
            ...(status && { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" }),
            ...(cursorDate && {
                createdAt: { lt: cursorDate },
            }),
        },
        include: postInclude,
        orderBy: { createdAt: "desc" },
        take: limit + 1,
    });

    // 2. Fetch reposts by this user
    // Reposts should only be shown if we're querying for PUBLISHED posts, 
    // or if no status filter is provided (meaning we show everything).
    // We shouldn't show reposts if they specifically asked for DRAFTs.
    let reposts: any[] = [];
    if (!status || status === "PUBLISHED") {
        reposts = await prisma.repost.findMany({
            where: {
                userId: userId,
                ...(cursorDate && {
                    createdAt: { lt: cursorDate },
                }),
            },
            include: {
                user: { select: { id: true, displayName: true } },
                post: { include: postInclude },
            },
            orderBy: { createdAt: "desc" },
            take: limit + 1,
        });
    }

    // Filter out reposts of unpublished/deleted posts
    const validReposts = reposts.filter((r) => r.post && r.post.status === "PUBLISHED");

    // 3. Map reposts to the generic Post shape, injecting the `repostedBy` tag
    const mappedReposts = validReposts.map((r) => ({
        ...r.post,
        repostedBy: r.user,
        feedTimestamp: r.createdAt.getTime(),
    }));

    const mappedOriginals = originalPosts.map((p) => ({
        ...p,
        repostedBy: null,
        feedTimestamp: p.createdAt.getTime(),
    }));

    // 4. Merge, sort, and paginate
    const combined = [...mappedOriginals, ...mappedReposts].sort(
        (a, b) => b.feedTimestamp - a.feedTimestamp
    );

    const hasMore = combined.length > limit;
    const items = hasMore ? combined.slice(0, limit) : combined;
    const nextCursor = hasMore ? new Date(items[items.length - 1].feedTimestamp).toISOString() : null;

    // Remove the temporary feedTimestamp property before attaching interactions
    const cleanedItems = items.map(({ feedTimestamp, ...post }) => post);

    const itemsWithInteractions = await attachInteractions(viewerId, cleanedItems);

    return { items: itemsWithInteractions, nextCursor, hasMore };
};

// ─── Update ────────────────────────────────────────────────

export const update = async (
    id: string,
    data: { title?: string; content?: string; mediaUrl?: string | null }
) => {
    return prisma.post.update({
        where: { id },
        data,
        include: postInclude,
    });
};

// ─── Update Status ─────────────────────────────────────────

export const updateStatus = async (id: string, status: string) => {
    return prisma.post.update({
        where: { id },
        data: {
            status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
            ...(status === "PUBLISHED" && { publishedAt: new Date() }),
        },
        include: postInclude,
    });
};

// ─── Soft Delete (archive) ─────────────────────────────────

export const softDelete = async (id: string) => {
    return prisma.post.update({
        where: { id },
        data: { status: "ARCHIVED" },
    });
};

// ─── Like / Unlike ─────────────────────────────────────────

export const like = async (userId: string, postId: string) => {
    return prisma.like.create({
        data: { userId, postId },
    });
};

export const unlike = async (userId: string, postId: string) => {
    return prisma.like.delete({
        where: { userId_postId: { userId, postId } },
    });
};

export const findLike = async (userId: string, postId: string) => {
    return prisma.like.findUnique({
        where: { userId_postId: { userId, postId } },
    });
};

// ─── Bookmark / Unbookmark ─────────────────────────────────

export const bookmark = async (userId: string, postId: string) => {
    return prisma.bookmark.create({
        data: { userId, postId },
    });
};

export const unbookmark = async (userId: string, postId: string) => {
    return prisma.bookmark.delete({
        where: { userId_postId: { userId, postId } },
    });
};

export const findBookmark = async (userId: string, postId: string) => {
    return prisma.bookmark.findUnique({
        where: { userId_postId: { userId, postId } },
    });
};

// ─── Repost / Unrepost ─────────────────────────────────────

export const repost = async (userId: string, postId: string) => {
    return prisma.repost.create({
        data: { userId, postId },
    });
};

export const unrepost = async (userId: string, postId: string) => {
    return prisma.repost.delete({
        where: { userId_postId: { userId, postId } },
    });
};

export const findRepost = async (userId: string, postId: string) => {
    return prisma.repost.findUnique({
        where: { userId_postId: { userId, postId } },
    });
};

// ─── Get user interactions for a post ──────────────────────

export const getUserInteractions = async (userId: string, postId: string) => {
    const [isLiked, isBookmarked, isReposted] = await Promise.all([
        findLike(userId, postId),
        findBookmark(userId, postId),
        findRepost(userId, postId),
    ]);

    return {
        isLiked: !!isLiked,
        isBookmarked: !!isBookmarked,
        isReposted: !!isReposted,
    };
};

export const attachInteractions = async <T extends { id: string }>(
    userId: string | undefined,
    posts: T[]
) => {
    if (!userId || posts.length === 0) {
        return posts.map((post) => ({ ...post, interactions: null }));
    }

    const postIds = posts.map((p) => p.id);

    const [likes, bookmarks, reposts] = await Promise.all([
        prisma.like.findMany({
            where: { userId, postId: { in: postIds } },
            select: { postId: true },
        }),
        prisma.bookmark.findMany({
            where: { userId, postId: { in: postIds } },
            select: { postId: true },
        }),
        prisma.repost.findMany({
            where: { userId, postId: { in: postIds } },
            select: { postId: true },
        }),
    ]);

    const likedSet = new Set(likes.map((l) => l.postId));
    const bookmarkedSet = new Set(bookmarks.map((b) => b.postId));
    const repostedSet = new Set(reposts.map((r) => r.postId));

    return posts.map((post) => ({
        ...post,
        interactions: {
            isLiked: likedSet.has(post.id),
            isBookmarked: bookmarkedSet.has(post.id),
            isReposted: repostedSet.has(post.id),
        },
    }));
};
