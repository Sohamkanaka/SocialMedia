"use client";

interface FormErrorProps {
    message: string;
}

export function FormError({ message }: FormErrorProps) {
    return (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {message}
        </div>
    );
}
