import { z } from "zod";

// ─── Export Request Body ──────────────────────────────────

export const exportRequestSchema = z.object({
    format: z.enum(["JSON", "CSV"]).optional().default("JSON"),
});

// ─── Audit Log Query Params ──────────────────────────────

export const auditLogQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1))
        .pipe(z.number().min(1)),
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 20))
        .pipe(z.number().min(1).max(100)),
    entityType: z.string().optional(),
    action: z.string().optional(),
    userId: z.string().uuid().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});
