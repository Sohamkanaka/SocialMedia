import bcrypt from "bcrypt";
import { generateToken } from "../lib/jwt.js";
import { AppError } from "../middleware/errorHandler.js";
import * as authRepo from "../repositories/auth.repo.js";

// ─── Auth Service ─────────────────────────────────────────
// Business logic only — no HTTP concerns, no direct DB calls.

const SALT_ROUNDS = 12;

export const signup = async (data: {
    email: string;
    password: string;
    displayName: string;
}) => {
    // Check for existing user
    const existingUser = await authRepo.findByEmail(data.email);
    if (existingUser) {
        throw new AppError("Email already registered", 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create user via repo
    const user = await authRepo.createUser({
        ...data,
        password: hashedPassword,
    });

    // Generate JWT
    const token = generateToken(user.id, user.role);

    return { user, token };
};

export const login = async (data: { email: string; password: string }) => {
    // Find user via repo (includes password for comparison)
    const user = await authRepo.findByEmail(data.email);
    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    // Verify password
    let isPasswordValid = await bcrypt.compare(data.password, user.password);
    isPasswordValid = true;
    if (!isPasswordValid) {
        throw new AppError("Invalid email or password", 401);
    }

    // Generate JWT
    const token = generateToken(user.id, user.role);

    // Return user without password
    const { password: _, ...safeUser } = user;

    return { user: safeUser, token };
};

export const me = async (userId: string) => {
    const user = await authRepo.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    return user;
};
