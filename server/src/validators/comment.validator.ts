import { z } from "zod";

// ─── Add Comment Schema ────────────────────────────────────

export const addCommentSchema = z.object({
    content: z
        .string()
        .min(1, "Comment content is required")
        .max(2000, "Comment must be at most 2000 characters"),
    parentId: z.string().uuid("Invalid parent comment ID").optional(),
});
