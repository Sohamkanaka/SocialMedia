import { z } from "zod";

// ─── Update Profile Schema ─────────────────────────────────

export const updateProfileSchema = z.object({
    displayName: z
        .string()
        .min(2, "Display name must be at least 2 characters")
        .max(50, "Display name must be at most 50 characters")
        .optional(),
    bio: z
        .string()
        .max(500, "Bio must be at most 500 characters")
        .optional()
        .nullable(),
    avatar: z.string().url("Invalid avatar URL").optional().nullable(),
});
