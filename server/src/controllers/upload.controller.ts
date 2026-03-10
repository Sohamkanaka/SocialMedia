import type { Request, Response } from "express";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import * as uploadService from "../services/upload.service.js";

// ─── Upload Controller ────────────────────────────────────

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
        throw new AppError("No file provided", 400);
    }

    const url = await uploadService.uploadFile(req.file);

    res.status(201).json({
        success: true,
        message: "File uploaded successfully",
        data: { url },
    });
});
