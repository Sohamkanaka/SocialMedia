import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import * as authService from "../services/auth.service.js";

// ─── Auth Controller ──────────────────────────────────────
// Thin layer — extracts HTTP data, calls service, returns response.
// No business logic here.

export const signup = asyncHandler(async (req: Request, res: Response) => {
    const { user, token } = await authService.signup(req.body);

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: { user, token },
    });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { user, token } = await authService.login(req.body);

    res.status(200).json({
        success: true,
        message: "Login successful",
        data: { user, token },
    });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.me(req.user!.userId);

    res.status(200).json({
        success: true,
        data: { user },
    });
});
