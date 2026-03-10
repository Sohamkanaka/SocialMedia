import { Router } from "express";
import * as searchController from "../controllers/search.controller.js";
import { authenticate, optionalAuthenticate } from "../middleware/auth.js";
import { searchQuerySchema } from "../validators/search.validator.js";
import { validateQuery } from "../validators/index.js";

const router = Router();

// GET /api/search?q=...&type=posts|users|communities — Unified search
router.get("/", validateQuery(searchQuerySchema), optionalAuthenticate, searchController.search);

// GET /api/search/trending — Trending hashtags
router.get("/trending", searchController.getTrending);

// GET /api/search/suggested — Suggested users to follow
router.get("/suggested", authenticate, searchController.getSuggestedUsers);

export default router;
