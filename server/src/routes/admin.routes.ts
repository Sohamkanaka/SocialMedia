import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate, validateQuery } from "../validators/index.js";
import {
    updateUserRoleSchema,
    updateSettingsSchema,
    userListQuerySchema,
} from "../validators/admin.validator.js";

const router = Router();

// GET /api/admin/users — User management list (admin only)
router.get(
    "/users",
    authenticate,
    requireRole("ADMIN"),
    validateQuery(userListQuerySchema),
    adminController.getUsers
);

// PATCH /api/admin/users/:id/role — Update user role (admin only)
router.patch(
    "/users/:id/role",
    authenticate,
    requireRole("ADMIN"),
    validate(updateUserRoleSchema),
    adminController.updateUserRole
);

// GET /api/admin/settings — Get system settings (admin only)
router.get(
    "/settings",
    authenticate,
    requireRole("ADMIN"),
    adminController.getSettings
);

// PATCH /api/admin/settings — Update system settings (admin only)
router.patch(
    "/settings",
    authenticate,
    requireRole("ADMIN"),
    validate(updateSettingsSchema),
    adminController.updateSettings
);

export default router;
