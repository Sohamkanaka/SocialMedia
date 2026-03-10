import { z } from "zod";

// ─── Update User Role ─────────────────────────────────────

export const updateUserRoleSchema = z.object({
    role: z.enum(["USER", "MODERATOR", "ADMIN"]),
});

// ─── Update System Settings ──────────────────────────────

export const updateSettingsSchema = z.object({
    settings: z.array(
        z.object({
            key: z.string().min(1),
            value: z.string(),
            label: z.string().optional(),
            category: z.string().optional(),
        })
    ),
});

// ─── User List Query Params ──────────────────────────────

export const userListQuerySchema = z.object({
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
    search: z.string().optional(),
    role: z.enum(["USER", "MODERATOR", "ADMIN"]).optional(),
    accountStatus: z.string().optional(),
});
