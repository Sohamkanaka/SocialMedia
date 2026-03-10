"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSubmitReportMutation } from "@/store/api/reportApi";
import { cn } from "@/lib/utils";

interface ReportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    targetType: "POST" | "COMMENT" | "USER";
    targetId: string;
}

const REPORT_REASONS = [
    {
        value: "HATE_SPEECH" as const,
        label: "Hate Speech",
        description: "Promotes hatred against a person or group",
    },
    {
        value: "SPAM" as const,
        label: "Spam",
        description: "Unwanted commercial content or repetitive posts",
    },
    {
        value: "MISINFORMATION" as const,
        label: "Misinformation",
        description: "False or misleading information",
    },
    {
        value: "HARASSMENT" as const,
        label: "Harassment",
        description: "Targeted abuse or bullying of an individual",
    },
    {
        value: "NSFW" as const,
        label: "NSFW Content",
        description: "Inappropriate or explicit content",
    },
];

export function ReportDialog({
    isOpen,
    onClose,
    targetType,
    targetId,
}: ReportDialogProps) {
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [submitReport, { isLoading }] = useSubmitReportMutation();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!selectedReason) return;

        try {
            await submitReport({
                targetType,
                targetId,
                reason: selectedReason as "HATE_SPEECH" | "SPAM" | "MISINFORMATION" | "HARASSMENT" | "NSFW",
            }).unwrap();

            setIsSubmitted(true);
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (error: unknown) {
            const apiError = error as { data?: { message?: string } };
            setErrorMessage(
                apiError?.data?.message || "Failed to submit report. Please try again."
            );
        }
    };

    const handleClose = () => {
        setSelectedReason(null);
        setIsSubmitted(false);
        setErrorMessage(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                {isSubmitted ? (
                    <div className="py-8 text-center space-y-3">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <svg
                                className="h-6 w-6 text-green-600 dark:text-green-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <DialogTitle className="text-lg font-semibold">
                            Report Submitted
                        </DialogTitle>
                        <DialogDescription>
                            Thank you for helping keep our community safe. We will review your report shortly.
                        </DialogDescription>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Report Content</DialogTitle>
                            <DialogDescription>
                                Select the reason for reporting this content. Our moderation team will review it.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-2 py-4">
                            {REPORT_REASONS.map((reason) => (
                                <button
                                    key={reason.value}
                                    type="button"
                                    onClick={() => {
                                        setSelectedReason(reason.value);
                                        setErrorMessage(null);
                                    }}
                                    className={cn(
                                        "w-full text-left rounded-lg border p-3 transition-all duration-200",
                                        selectedReason === reason.value
                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                                    )}
                                >
                                    <Label className="text-sm font-medium cursor-pointer">
                                        {reason.label}
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {reason.description}
                                    </p>
                                </button>
                            ))}
                        </div>

                        {errorMessage && (
                            <p className="text-sm text-destructive">{errorMessage}</p>
                        )}

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={!selectedReason || isLoading}
                                variant="destructive"
                            >
                                {isLoading ? "Submitting..." : "Submit Report"}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
