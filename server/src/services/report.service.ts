import { AppError } from "../middleware/errorHandler.js";
import * as reportRepo from "../repositories/report.repo.js";
import * as riskScoringService from "./risk-scoring.service.js";

// ─── Report Service ───────────────────────────────────────
// Business logic only — no HTTP concerns, no direct DB calls.

// ─── Submit Report ─────────────────────────────────────────

export const submitReport = async (
    reporterId: string,
    data: {
        targetType: string;
        targetId: string;
        reason: string;
    }
) => {
    // Prevent duplicate reports from same user
    const existing = await reportRepo.findByReporterAndTarget(
        reporterId,
        data.targetType,
        data.targetId
    );

    if (existing) {
        throw new AppError("You have already reported this content", 409);
    }

    const report = await reportRepo.create({
        reporterId,
        targetType: data.targetType,
        targetId: data.targetId,
        reason: data.reason,
    });

    // Check if target should be auto-escalated based on report count
    const reportCount = await reportRepo.countByTarget(
        data.targetType,
        data.targetId
    );

    const shouldEscalate = riskScoringService.shouldEscalate(reportCount);

    return { report, reportCount, shouldEscalate };
};

// ─── List Reports (Moderator Only) ─────────────────────────

export const listReports = async (filters: {
    status?: string;
    reason?: string;
    targetType?: string;
    page: number;
    limit: number;
}) => {
    return reportRepo.findAll(filters);
};

// ─── Update Report Status ──────────────────────────────────

export const updateReportStatus = async (
    reportId: string,
    status: string,
    moderatorId: string
) => {
    const report = await reportRepo.findById(reportId);
    if (!report) {
        throw new AppError("Report not found", 404);
    }

    // Validate lifecycle transitions
    const validTransitions: Record<string, string[]> = {
        PENDING: ["REVIEWED", "RESOLVED"],
        REVIEWED: ["RESOLVED"],
        RESOLVED: [], // No transitions from resolved
    };

    const allowed = validTransitions[report.status] || [];
    if (!allowed.includes(status)) {
        throw new AppError(
            `Cannot transition from ${report.status} to ${status}`,
            400
        );
    }

    return reportRepo.updateStatus(reportId, status, moderatorId);
};
