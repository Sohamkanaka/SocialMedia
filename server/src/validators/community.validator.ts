import { z } from "zod";

// ─── Create Community Schema ───────────────────────────────

export const createCommunitySchema = z.object({
    name: z
        .string()
        .min(2, "Community name must be at least 2 characters")
        .max(100, "Community name must be at most 100 characters"),
    description: z
        .string()
        .max(500, "Description must be at most 500 characters")
        .optional(),
});

// ─── Update Member Role Schema ─────────────────────────────

export const updateMemberRoleSchema = z.object({
    role: z.enum(["MEMBER", "MODERATOR"]),
});
