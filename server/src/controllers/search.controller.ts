import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import * as searchService from "../services/search.service.js";

// ─── Search Controller ───────────────────────────────────
// Thin layer — extracts HTTP data, calls service, returns response.

export const search = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query.q as string;
    const type = req.query.type as string | undefined;
    const communityId = req.query.communityId as string | undefined;

    const results = await searchService.search(query, type, communityId, req.user?.userId);

    res.status(200).json({
        success: true,
        data: results,
    });
});

export const getTrending = asyncHandler(
    async (_req: Request, res: Response) => {
        const trending = await searchService.getTrending();

        res.status(200).json({
            success: true,
            data: { trending },
        });
    }
);

export const getSuggestedUsers = asyncHandler(
    async (req: Request, res: Response) => {
        const users = await searchService.getSuggestedUsers(req.user!.userId);

        res.status(200).json({
            success: true,
            data: { users },
        });
    }
);
