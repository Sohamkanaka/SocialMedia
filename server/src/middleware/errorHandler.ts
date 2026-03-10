import type { Request, Response, NextFunction } from "express";

// ─── Custom error class ────────────────────────────────────

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly errors?: Record<string, string[]>;

    constructor(
        message: string,
        statusCode: number = 500,
        errors?: Record<string, string[]>
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

// ─── Async handler wrapper (eliminates try-catch in every controller) ──

export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// ─── Global error handler ──────────────────────────────────

export const globalErrorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.errors && { errors: err.errors }),
        });
        return;
    }

    console.error("Unhandled Error:", err);
    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};
