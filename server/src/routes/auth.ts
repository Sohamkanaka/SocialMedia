import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../validators/index.js";
import { signupSchema, loginSchema } from "../validators/auth.validator.js";

const router = Router();

// POST /api/auth/signup — Register a new user
router.post("/signup", validate(signupSchema), authController.signup);

// POST /api/auth/login — Authenticate and return JWT
router.post("/login", validate(loginSchema), authController.login);

// GET /api/auth/me — Get current authenticated user
router.get("/me", authenticate, authController.me);

export default router;
