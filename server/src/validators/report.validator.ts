import { z } from "zod";

// ─── Create Report Schema ──────────────────────────────────

export const createReportSchema = z.object({
    targetType: z.enum(["POST", "COMMENT", "USER"]),
    targetId: z.string().uuid("Invalid target ID"),
    reason: z.enum(["HATE_SPEECH", "SPAM", "MISINFORMATION", "HARASSMENT", "NSFW"]),
});

// ─── Update Report Status Schema ───────────────────────────

export const updateReportStatusSchema = z.object({
    status: z.enum(["PENDING", "REVIEWED", "RESOLVED"]),
});

// ─── List Reports Query Schema ─────────────────────────────

export const listReportsQuerySchema = z.object({
    status: z.enum(["PENDING", "REVIEWED", "RESOLVED"]).optional(),
    reason: z.enum(["HATE_SPEECH", "SPAM", "MISINFORMATION", "HARASSMENT", "NSFW"]).optional(),
    targetType: z.enum(["POST", "COMMENT", "USER"]).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});
