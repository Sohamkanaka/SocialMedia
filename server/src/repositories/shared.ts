// ─── Shared Prisma Select/Include Objects ─────────────────
// Centralized definitions to prevent drift across repositories.

export const authorSelect = {
    id: true,
    displayName: true,
    avatar: true,
    role: true,
} as const;

export const actorSelect = {
    id: true,
    displayName: true,
    avatar: true,
} as const;

export const communitySelect = {
    id: true,
    name: true,
    slug: true,
} as const;

export const postInclude = {
    author: { select: authorSelect },
    community: { select: communitySelect },
    pollOptions: {
        select: { id: true, text: true, votesCount: true },
        orderBy: { text: "asc" as const },
    },
    _count: {
        select: {
            comments: true,
            likes: true,
            bookmarks: true,
            reposts: true,
        },
    },
} as const;
