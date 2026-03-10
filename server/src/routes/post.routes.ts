import { Router } from "express";
import * as postController from "../controllers/post.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../validators/index.js";
import {
    createPostSchema,
    updatePostSchema,
    updatePostStatusSchema,
} from "../validators/post.validator.js";

const router = Router();

// POST /api/posts — Create a new post
router.post("/", authenticate, validate(createPostSchema), postController.createPost);

// GET /api/posts/feed — Get home feed (paginated)
router.get("/feed", authenticate, postController.getFeed);

// GET /api/posts/:id — Get single post
router.get("/:id", postController.getPost);

// PATCH /api/posts/:id — Edit post
router.patch("/:id", authenticate, validate(updatePostSchema), postController.updatePost);

// DELETE /api/posts/:id — Soft delete post
router.delete("/:id", authenticate, postController.deletePost);

// PATCH /api/posts/:id/status — Update post lifecycle status
router.patch(
    "/:id/status",
    authenticate,
    validate(updatePostStatusSchema),
    postController.updatePostStatus
);

// POST /api/posts/:id/like — Like a post
router.post("/:id/like", authenticate, postController.likePost);

// DELETE /api/posts/:id/like — Unlike a post
router.delete("/:id/like", authenticate, postController.unlikePost);

// POST /api/posts/:id/bookmark — Bookmark a post
router.post("/:id/bookmark", authenticate, postController.bookmarkPost);

// DELETE /api/posts/:id/bookmark — Unbookmark a post
router.delete("/:id/bookmark", authenticate, postController.unbookmarkPost);

// POST /api/posts/:id/repost — Repost a post
router.post("/:id/repost", authenticate, postController.repostPost);

// DELETE /api/posts/:id/repost — Unrepost a post
router.delete("/:id/repost", authenticate, postController.unrepostPost);

export default router;
