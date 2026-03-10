import * as searchRepo from "../repositories/search.repo.js";

// ─── Search Service ───────────────────────────────────────
// Business logic only — no HTTP concerns, no direct DB calls.

// ─── Unified Search ────────────────────────────────────────

export const search = async (
    query: string,
    type?: string,
    communityId?: string,
    viewerId?: string
) => {
    if (!query || query.trim().length === 0) {
        return { posts: [], users: [], communities: [] };
    }

    const trimmedQuery = query.trim();

    switch (type) {
        case "posts":
            return { posts: await searchRepo.searchPosts(trimmedQuery, 20, communityId) };
        case "users":
            return { users: await searchRepo.searchUsers(trimmedQuery, viewerId) };
        case "communities":
            return { communities: await searchRepo.searchCommunities(trimmedQuery) };
        default: {
            // Search all types in parallel
            const [posts, users, communities] = await Promise.all([
                searchRepo.searchPosts(trimmedQuery, 10, communityId),
                searchRepo.searchUsers(trimmedQuery, viewerId, 10),
                searchRepo.searchCommunities(trimmedQuery, 10),
            ]);
            return { posts, users, communities };
        }
    }
};

// ─── Trending Hashtags ─────────────────────────────────────

export const getTrending = async () => {
    return searchRepo.getTrendingHashtags();
};

// ─── Suggested Users ───────────────────────────────────────

export const getSuggestedUsers = async (userId: string) => {
    return searchRepo.getSuggestedUsers(userId);
};
