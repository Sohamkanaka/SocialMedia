import { Router } from "express";
import * as complianceController from "../controllers/compliance.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate, validateQuery } from "../validators/index.js";
import {
    exportRequestSchema,
    auditLogQuerySchema,
} from "../validators/compliance.validator.js";

const router = Router();

// POST /api/compliance/export — Request a data export (any authenticated user)
router.post(
    "/export",
    authenticate,
    validate(exportRequestSchema),
    complianceController.requestExport
);

// GET /api/compliance/exports — List user's export history
router.get("/exports", authenticate, complianceController.listExports);

// GET /api/compliance/exports/:id/download — Download export file
router.get(
    "/exports/:id/download",
    authenticate,
    complianceController.downloadExport
);

// GET /api/compliance/audit-logs — View audit logs (admin only)
router.get(
    "/audit-logs",
    authenticate,
    requireRole("ADMIN"),
    validateQuery(auditLogQuerySchema),
    complianceController.getAuditLogs
);

export default router;
