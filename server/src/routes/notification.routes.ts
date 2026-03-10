import { Router } from "express";
import * as notificationController from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// GET /api/notifications — List user notifications
router.get("/", notificationController.getNotifications);

// GET /api/notifications/unread-count — Get unread notification count
router.get("/unread-count", notificationController.getUnreadCount);

// PATCH /api/notifications/read-all — Mark all notifications as read
router.patch("/read-all", notificationController.markAllAsRead);

// PATCH /api/notifications/:id/read — Mark single notification as read
router.patch("/:id/read", notificationController.markAsRead);

export default router;
