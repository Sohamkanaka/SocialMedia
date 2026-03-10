import { Router } from "express";
import * as moderationController from "../controllers/moderation.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

// GET /api/moderation/queue — Get flagged posts queue (moderator/admin only)
router.get(
    "/queue",
    authenticate,
    requireRole("MODERATOR", "ADMIN"),
    moderationController.getModerationQueue
);

// GET /api/moderation/audit — Get audit history (moderator/admin only)
router.get(
    "/audit",
    authenticate,
    requireRole("MODERATOR", "ADMIN"),
    moderationController.getAuditHistory
);

// POST /api/moderation/:postId/approve — Approve a flagged post
router.post(
    "/:postId/approve",
    authenticate,
    requireRole("MODERATOR", "ADMIN"),
    moderationController.approvePost
);

// POST /api/moderation/:postId/remove — Remove a flagged post
router.post(
    "/:postId/remove",
    authenticate,
    requireRole("MODERATOR", "ADMIN"),
    moderationController.removePost
);

// POST /api/moderation/:postId/warn-user — Warn the user who posted
router.post(
    "/:postId/warn-user",
    authenticate,
    requireRole("MODERATOR", "ADMIN"),
    moderationController.warnUser
);

// POST /api/moderation/:postId/escalate — Escalate to admin
router.post(
    "/:postId/escalate",
    authenticate,
    requireRole("MODERATOR", "ADMIN"),
    moderationController.escalatePost
);

export default router;
