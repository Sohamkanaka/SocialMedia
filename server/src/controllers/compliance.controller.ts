import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import * as complianceService from "../services/compliance.service.js";

// ─── Compliance Controller ────────────────────────────────
// Thin layer — extracts HTTP data, calls service, returns response.

export const requestExport = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const format = req.body.format || "JSON";

        const result = await complianceService.requestExport(userId, format);

        res.status(201).json({
            success: true,
            data: result,
        });
    }
);

export const listExports = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const page = req.query.page
            ? parseInt(req.query.page as string, 10)
            : 1;
        const limit = req.query.limit
            ? parseInt(req.query.limit as string, 10)
            : 10;

        const result = await complianceService.listExports(
            userId,
            page,
            limit
        );

        res.status(200).json({
            success: true,
            data: result,
        });
    }
);

export const downloadExport = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const exportId = req.params.id as string;

        const { filePath, fileName } =
            await complianceService.getExportDownload(exportId, userId);

        res.download(filePath, fileName);
    }
);

export const getAuditLogs = asyncHandler(
    async (req: Request, res: Response) => {
        const page = req.query.page
            ? parseInt(req.query.page as string, 10)
            : 1;
        const limit = req.query.limit
            ? parseInt(req.query.limit as string, 10)
            : 20;
        const filters = {
            entityType: req.query.entityType as string | undefined,
            action: req.query.action as string | undefined,
            userId: req.query.userId as string | undefined,
            startDate: req.query.startDate as string | undefined,
            endDate: req.query.endDate as string | undefined,
        };

        const result = await complianceService.getAuditLogs(
            page,
            limit,
            filters
        );

        res.status(200).json({
            success: true,
            data: result,
        });
    }
);
