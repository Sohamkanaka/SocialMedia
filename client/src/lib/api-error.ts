/**
 * RTK Query error type and type guard for safe error handling.
 */

export interface RTKQueryError {
    data?: { message?: string; errors?: Record<string, string[]> };
    status?: number;
}

export function isApiError(error: unknown): error is RTKQueryError {
    return typeof error === "object" && error !== null && "data" in error;
}

export function getErrorMessage(error: unknown, fallback: string): string {
    if (isApiError(error)) {
        return error.data?.message || fallback;
    }
    return fallback;
}

export function getFieldErrors(
    error: unknown
): Record<string, string[]> | undefined {
    if (isApiError(error)) {
        return error.data?.errors;
    }
    return undefined;
}
