import { Router } from "express";
import * as commentController from "../controllers/comment.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../validators/index.js";
import { addCommentSchema } from "../validators/comment.validator.js";

const router = Router();

// POST /api/posts/:id/comments — Add comment to a post
router.post(
    "/:id/comments",
    authenticate,
    validate(addCommentSchema),
    commentController.addComment
);

// GET /api/posts/:id/comments — Get comments for a post
router.get("/:id/comments", commentController.getComments);

export default router;
