import { AppError } from "../middleware/errorHandler.js";
import * as communityRepo from "../repositories/community.repo.js";

// ─── Community Service ────────────────────────────────────
// Business logic only — no HTTP concerns, no direct DB calls.

// ─── Slug Generator ────────────────────────────────────────

const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80);
};

// ─── Create Community ──────────────────────────────────────

export const createCommunity = async (
    userId: string,
    data: { name: string; description?: string }
) => {
    let slug = generateSlug(data.name);

    // Ensure unique slug
    const existing = await communityRepo.findBySlug(slug);
    if (existing) {
        slug = `${slug}-${Date.now().toString(36)}`;
    }

    return communityRepo.create({
        name: data.name,
        slug,
        description: data.description,
        creatorId: userId,
    });
};

// ─── List Communities ──────────────────────────────────────

export const listCommunities = async (cursor?: string, limit?: number) => {
    return communityRepo.findAll(cursor, limit);
};

// ─── Get Community Details ─────────────────────────────────

export const getCommunityDetails = async (id: string, userId?: string) => {
    const community = await communityRepo.findById(id);
    if (!community) {
        throw new AppError("Community not found", 404);
    }

    let membership = null;
    if (userId) {
        membership = await communityRepo.findMembership(userId, id);
    }

    return {
        ...community,
        isMember: !!membership,
        memberRole: membership?.role || null,
    };
};

// ─── Get Community Feed ────────────────────────────────────

export const getCommunityFeed = async (
    id: string,
    cursor?: string,
    limit?: number
) => {
    const community = await communityRepo.findById(id);
    if (!community) {
        throw new AppError("Community not found", 404);
    }

    return communityRepo.findCommunityPosts(id, cursor, limit);
};

// ─── Join Community ────────────────────────────────────────

export const joinCommunity = async (userId: string, communityId: string) => {
    const community = await communityRepo.findById(communityId);
    if (!community) {
        throw new AppError("Community not found", 404);
    }

    const existing = await communityRepo.findMembership(userId, communityId);
    if (existing) {
        throw new AppError("Already a member of this community", 409);
    }

    return communityRepo.addMember(userId, communityId);
};

// ─── Leave Community ───────────────────────────────────────

export const leaveCommunity = async (userId: string, communityId: string) => {
    const community = await communityRepo.findById(communityId);
    if (!community) {
        throw new AppError("Community not found", 404);
    }

    if (community.creatorId === userId) {
        throw new AppError("Community owner cannot leave the community", 400);
    }

    const membership = await communityRepo.findMembership(userId, communityId);
    if (!membership) {
        throw new AppError("You are not a member of this community", 404);
    }

    return communityRepo.removeMember(userId, communityId);
};

// ─── Get Members ───────────────────────────────────────────

export const getMembers = async (
    communityId: string,
    cursor?: string,
    limit?: number
) => {
    const community = await communityRepo.findById(communityId);
    if (!community) {
        throw new AppError("Community not found", 404);
    }

    return communityRepo.findMembers(communityId, cursor, limit);
};

// ─── Update Member Role ───────────────────────────────────

export const updateMemberRole = async (
    userId: string,
    communityId: string,
    targetUserId: string,
    role: string
) => {
    const community = await communityRepo.findById(communityId);
    if (!community) {
        throw new AppError("Community not found", 404);
    }

    // Only the community creator or a moderator can change roles
    const actorMembership = await communityRepo.findMembership(userId, communityId);
    const isCreator = community.creatorId === userId;
    const isModerator = actorMembership?.role === "MODERATOR";

    if (!isCreator && !isModerator) {
        throw new AppError("Only community owner or moderators can change roles", 403);
    }

    // Cannot change role of the creator
    if (targetUserId === community.creatorId) {
        throw new AppError("Cannot change the role of the community owner", 400);
    }

    const targetMembership = await communityRepo.findMembership(targetUserId, communityId);
    if (!targetMembership) {
        throw new AppError("Target user is not a member of this community", 404);
    }

    return communityRepo.updateMemberRole(
        targetUserId,
        communityId,
        role as "MEMBER" | "MODERATOR"
    );
};
