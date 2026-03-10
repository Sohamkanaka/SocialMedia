import { z } from "zod";

// ─── Create Post Schema ────────────────────────────────────

export const createPostSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(300, "Title must be at most 300 characters"),
    content: z.string().optional(),
    type: z.enum(["TEXT", "IMAGE", "VIDEO", "POLL", "THREAD"]).default("TEXT"),
    status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
    mediaUrl: z.string().url("Invalid media URL").optional(),
    communityId: z.string().uuid("Invalid community ID").optional(),
    scheduledAt: z.string().datetime().optional(),
    pollOptions: z
        .array(
            z.object({
                text: z
                    .string()
                    .min(1, "Option text is required")
                    .max(200, "Option must be at most 200 characters"),
            })
        )
        .min(2, "At least 2 poll options are required")
        .max(6, "At most 6 poll options")
        .optional(),
});

// ─── Update Post Schema ────────────────────────────────────

export const updatePostSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(300, "Title must be at most 300 characters")
        .optional(),
    content: z.string().optional(),
    mediaUrl: z.string().url("Invalid media URL").optional().nullable(),
});

// ─── Update Post Status Schema ─────────────────────────────

export const updatePostStatusSchema = z.object({
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});
