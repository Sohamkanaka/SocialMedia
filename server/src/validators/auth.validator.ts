import { z } from "zod";

// ─── Zod Schemas ───────────────────────────────────────────

export const signupSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        ),
    displayName: z
        .string()
        .min(2, "Display name must be at least 2 characters")
        .max(50, "Display name must be at most 50 characters"),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

