import { z } from "zod";

// ─── Suspend User Schema ───────────────────────────────────

export const suspendUserSchema = z.object({
    type: z.enum(["TEMP", "PERMANENT"]),
    reason: z.string().min(1, "Reason is required").max(500, "Reason must be at most 500 characters"),
    duration: z.number().int().min(1).max(365).optional(), // days, for temp suspension
});

// ─── Appeal Schema ─────────────────────────────────────────

export const appealSchema = z.object({
    reason: z.string().min(1, "Appeal reason is required").max(1000, "Appeal must be at most 1000 characters"),
});

// ─── Warn User Schema ──────────────────────────────────────

export const warnUserSchema = z.object({
    reason: z.string().min(1, "Reason is required").max(500, "Reason must be at most 500 characters"),
});
