import { z } from "zod";

// ─── Analytics Query Params ───────────────────────────────

export const analyticsQuerySchema = z.object({
    days: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 30))
        .pipe(z.number().min(1).max(365)),
});
