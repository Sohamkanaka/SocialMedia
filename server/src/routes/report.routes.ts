import { Router } from "express";
import * as reportController from "../controllers/report.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../validators/index.js";
import {
    createReportSchema,
    updateReportStatusSchema,
} from "../validators/report.validator.js";

const router = Router();

// POST /api/reports — Submit a report (authenticated users)
router.post(
    "/",
    authenticate,
    validate(createReportSchema),
    reportController.submitReport
);

// GET /api/reports — List reports (moderator/admin only)
router.get(
    "/",
    authenticate,
    requireRole("MODERATOR", "ADMIN"),
    reportController.listReports
);

// PATCH /api/reports/:id — Update report status (moderator/admin only)
router.patch(
    "/:id",
    authenticate,
    requireRole("MODERATOR", "ADMIN"),
    validate(updateReportStatusSchema),
    reportController.updateReportStatus
);

export default router;
