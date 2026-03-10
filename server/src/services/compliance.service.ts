import * as complianceRepo from "../repositories/compliance.repo.js";
import { AppError } from "../middleware/errorHandler.js";
import type { DataExportFormat } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXPORTS_DIR = path.join(__dirname, "../../exports");

// ─── Compliance Service ───────────────────────────────────

// ─── Request Data Export ──────────────────────────────────

export const requestExport = async (
    userId: string,
    format: DataExportFormat
) => {
    // Create export record
    const exportRecord = await complianceRepo.createDataExport(userId, format);

    // Process export (in real app this would be a background job)
    try {
        await complianceRepo.updateDataExport(exportRecord.id, {
            status: "PROCESSING",
        });

        const userData = await complianceRepo.gatherUserData(userId);

        // Ensure exports directory exists
        if (!fs.existsSync(EXPORTS_DIR)) {
            fs.mkdirSync(EXPORTS_DIR, { recursive: true });
        }

        const fileName = `export_${userId}_${Date.now()}.${format.toLowerCase()}`;
        const filePath = path.join(EXPORTS_DIR, fileName);

        let content: string;
        if (format === "JSON") {
            content = JSON.stringify(userData, null, 2);
        } else {
            // CSV: flatten profile + counts
            const lines: string[] = [];
            lines.push("section,data");
            lines.push(
                `profile,"${JSON.stringify(userData.profile).replace(/"/g, '""')}"`
            );
            lines.push(`posts_count,${userData.posts.length}`);
            lines.push(`comments_count,${userData.comments.length}`);
            lines.push(`likes_count,${userData.likes.length}`);
            lines.push(`follows_count,${userData.follows.length}`);
            lines.push(`bookmarks_count,${userData.bookmarks.length}`);
            lines.push("");
            lines.push("--- Posts ---");
            for (const post of userData.posts) {
                lines.push(
                    `post,"${JSON.stringify(post).replace(/"/g, '""')}"`
                );
            }
            content = lines.join("\n");
        }

        fs.writeFileSync(filePath, content, "utf-8");
        const fileStats = fs.statSync(filePath);

        // Set 24-hour expiry
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await complianceRepo.updateDataExport(exportRecord.id, {
            status: "COMPLETED",
            filePath: fileName,
            fileSize: fileStats.size,
            expiresAt,
        });

        // Create audit log
        await complianceRepo.createAuditLog({
            userId,
            action: "DATA_EXPORT_REQUESTED",
            entityType: "DataExport",
            entityId: exportRecord.id,
            metadata: JSON.stringify({ format }),
        });

        return {
            message: "Data export completed",
            exportId: exportRecord.id,
        };
    } catch (error) {
        await complianceRepo.updateDataExport(exportRecord.id, {
            status: "FAILED",
            error: error instanceof Error ? error.message : "Unknown error",
        });
        throw new AppError("Failed to generate data export", 500);
    }
};

// ─── List User Exports ───────────────────────────────────

export const listExports = async (
    userId: string,
    page: number = 1,
    limit: number = 10
) => {
    return complianceRepo.listExports(userId, page, limit);
};

// ─── Download Export ──────────────────────────────────────

export const getExportDownload = async (exportId: string, userId: string) => {
    const exportRecord = await complianceRepo.findExportById(exportId);

    if (!exportRecord) {
        throw new AppError("Export not found", 404);
    }

    if (exportRecord.userId !== userId) {
        throw new AppError("Access denied", 403);
    }

    if (exportRecord.status !== "COMPLETED") {
        throw new AppError("Export is not yet ready for download", 400);
    }

    if (
        exportRecord.expiresAt &&
        new Date() > new Date(exportRecord.expiresAt)
    ) {
        throw new AppError("Export has expired", 410);
    }

    if (!exportRecord.filePath) {
        throw new AppError("Export file not found", 404);
    }

    const fullPath = path.join(EXPORTS_DIR, exportRecord.filePath);

    if (!fs.existsSync(fullPath)) {
        throw new AppError("Export file not found on disk", 404);
    }

    return { filePath: fullPath, fileName: exportRecord.filePath };
};

// ─── Get Audit Logs ──────────────────────────────────────

export const getAuditLogs = async (
    page: number = 1,
    limit: number = 20,
    filters: {
        entityType?: string;
        action?: string;
        userId?: string;
        startDate?: string;
        endDate?: string;
    } = {}
) => {
    return complianceRepo.getAuditLogs(page, limit, filters);
};
