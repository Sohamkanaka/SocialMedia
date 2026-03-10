import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validateQuery } from "../validators/index.js";
import { analyticsQuerySchema } from "../validators/analytics.validator.js";

const router = Router();

// GET /api/analytics/creator — Creator analytics (any authenticated user)
router.get(
    "/creator",
    authenticate,
    validateQuery(analyticsQuerySchema),
    analyticsController.getCreatorAnalytics
);

// GET /api/analytics/admin — Platform analytics (admin only)
router.get(
    "/admin",
    authenticate,
    requireRole("ADMIN"),
    validateQuery(analyticsQuerySchema),
    analyticsController.getAdminAnalytics
);

export default router;
