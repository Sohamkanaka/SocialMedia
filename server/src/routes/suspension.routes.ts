import { Router } from "express";
import * as suspensionController from "../controllers/suspension.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../validators/index.js";
import {
    suspendUserSchema,
    appealSchema,
    warnUserSchema,
} from "../validators/suspension.validator.js";

const router = Router();

// GET /api/users/suspended — List suspended users (admin only)
router.get(
    "/suspended",
    authenticate,
    requireRole("ADMIN"),
    suspensionController.getSuspendedUsers
);

// GET /api/users/appeals — List appeals (admin only)
router.get(
    "/appeals",
    authenticate,
    requireRole("ADMIN"),
    suspensionController.getAppeals
);

// GET /api/users/repeat-offenders — List repeat offenders (admin only)
router.get(
    "/repeat-offenders",
    authenticate,
    requireRole("ADMIN"),
    suspensionController.getRepeatOffenders
);

// GET /api/users/audit-history — Get moderation audit history (admin only)
router.get(
    "/audit-history",
    authenticate,
    requireRole("ADMIN"),
    suspensionController.getAuditHistory
);

// POST /api/users/:id/warn — Warn a user (moderator/admin)
router.post(
    "/:id/warn",
    authenticate,
    requireRole("MODERATOR", "ADMIN"),
    validate(warnUserSchema),
    suspensionController.warnUser
);

// POST /api/users/:id/suspend — Suspend a user (admin only)
router.post(
    "/:id/suspend",
    authenticate,
    requireRole("ADMIN"),
    validate(suspendUserSchema),
    suspensionController.suspendUser
);

// POST /api/users/:id/appeal — Submit appeal (authenticated, self only)
router.post(
    "/:id/appeal",
    authenticate,
    validate(appealSchema),
    suspensionController.submitAppeal
);

// POST /api/users/:id/reinstate — Reinstate a user (admin only)
router.post(
    "/:id/reinstate",
    authenticate,
    requireRole("ADMIN"),
    suspensionController.reinstateUser
);

export default router;
