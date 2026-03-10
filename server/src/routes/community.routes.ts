import { Router } from "express";
import * as communityController from "../controllers/community.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../validators/index.js";
import {
    createCommunitySchema,
    updateMemberRoleSchema,
} from "../validators/community.validator.js";

const router = Router();

// POST /api/communities — Create a new community
router.post(
    "/",
    authenticate,
    validate(createCommunitySchema),
    communityController.createCommunity
);

// GET /api/communities — List all communities
router.get("/", communityController.listCommunities);

// GET /api/communities/:id — Get community details
router.get("/:id", communityController.getCommunity);

// GET /api/communities/:id/feed — Get community feed
router.get("/:id/feed", communityController.getCommunityFeed);

// POST /api/communities/:id/join — Join community
router.post("/:id/join", authenticate, communityController.joinCommunity);

// DELETE /api/communities/:id/leave — Leave community
router.delete("/:id/leave", authenticate, communityController.leaveCommunity);

// GET /api/communities/:id/members — Get member list
router.get("/:id/members", communityController.getMembers);

// PATCH /api/communities/:id/members/:userId/role — Update member role
router.patch(
    "/:id/members/:userId/role",
    authenticate,
    validate(updateMemberRoleSchema),
    communityController.updateMemberRole
);

export default router;
