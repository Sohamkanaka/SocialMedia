import type { Request, Response, NextFunction } from "express";
import { verifyToken, type JwtPayload } from "../lib/jwt.js";
import { AppError } from "./errorHandler.js";

// ─── Extend Express Request ────────────────────────────────

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

// ─── JWT Authentication Middleware ─────────────────────────

export const authenticate = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError("Authentication required", 401);
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = verifyToken(token);
        req.user = payload;
        next();
    } catch {
        throw new AppError("Invalid or expired token", 401);
    }
};

// ─── Optional JWT Authentication Middleware ────────────────
// Populates req.user if a valid token exists, but proceeds
// without error if it doesn't.

export const optionalAuthenticate = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = verifyToken(token);
        req.user = payload;
    } catch {
        // Ignore invalid token, just don't set req.user
    }

    next();
};

// ─── Role-Based Authorization Middleware ───────────────────

export const requireRole = (...roles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        if (!roles.includes(req.user.role)) {
            throw new AppError("Insufficient permissions", 403);
        }

        next();
    };
};
