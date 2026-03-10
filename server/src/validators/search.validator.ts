import { z } from "zod";

// ─── Search Query Schema ───────────────────────────────────

export const searchQuerySchema = z.object({
    q: z
        .string()
        .min(1, "Search query is required")
        .max(200, "Search query must be at most 200 characters"),
    type: z.enum(["posts", "users", "communities"]).optional(),
    communityId: z.string().uuid("Invalid community ID").optional(),
});
