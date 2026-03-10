import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { authenticate, optionalAuthenticate } from "../middleware/auth.js";
import { validate } from "../validators/index.js";
import { updateProfileSchema } from "../validators/user.validator.js";

const router = Router();

// PATCH /api/users/me — Update own profile (must be before :id routes)
router.patch(
    "/me",
    authenticate,
    validate(updateProfileSchema),
    userController.updateProfile
);

// GET /api/users/me/bookmarks — Get own bookmarks
router.get("/me/bookmarks", authenticate, userController.getBookmarks);

// GET /api/users/:id — Get user profile
router.get("/:id", optionalAuthenticate, userController.getProfile);

// GET /api/users/:id/posts — Get user's posts
router.get("/:id/posts", authenticate, userController.getUserPosts);

// POST /api/users/:id/follow — Follow user
router.post("/:id/follow", authenticate, userController.followUser);

// DELETE /api/users/:id/follow — Unfollow user
router.delete("/:id/follow", authenticate, userController.unfollowUser);

// GET /api/users/:id/followers — Get followers
router.get("/:id/followers", optionalAuthenticate, userController.getFollowers);

// GET /api/users/:id/following — Get following
router.get("/:id/following", optionalAuthenticate, userController.getFollowing);

export default router;
