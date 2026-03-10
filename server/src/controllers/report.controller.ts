import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import * as reportService from "../services/report.service.js";

// ─── Report Controller ────────────────────────────────────
// Thin layer — extracts HTTP data, calls service, returns response.

export const submitReport = asyncHandler(
    async (req: Request, res: Response) => {
        const result = await reportService.submitReport(
            req.user!.userId,
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Report submitted successfully",
            data: {
                report: result.report,
                reportCount: result.reportCount,
                shouldEscalate: result.shouldEscalate,
            },
        });
    }
);

export const listReports = asyncHandler(
    async (req: Request, res: Response) => {
        const filters = {
            status: req.query.status as string | undefined,
            reason: req.query.reason as string | undefined,
            targetType: req.query.targetType as string | undefined,
            page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
            limit: req.query.limit
                ? parseInt(req.query.limit as string, 10)
                : 20,
        };

        const reports = await reportService.listReports(filters);

        res.status(200).json({
            success: true,
            data: reports,
        });
    }
);

export const updateReportStatus = asyncHandler(
    async (req: Request, res: Response) => {
        const reportId = req.params.id as string;
        const report = await reportService.updateReportStatus(
            reportId,
            req.body.status,
            req.user!.userId
        );

        res.status(200).json({
            success: true,
            message: "Report status updated successfully",
            data: { report },
        });
    }
);
