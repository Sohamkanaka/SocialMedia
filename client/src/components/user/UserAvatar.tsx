"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
    displayName: string;
    avatar?: string | null;
    className?: string;
    fallbackClassName?: string;
}

/**
 * Reusable avatar component that renders AvatarImage when
 * an avatar URL is available, with initials fallback.
 */
export function UserAvatar({
    displayName,
    avatar,
    className,
    fallbackClassName,
}: UserAvatarProps) {
    return (
        <Avatar className={cn("h-10 w-10", className)}>
            {avatar && (
                <AvatarImage src={avatar} alt={displayName} />
            )}
            <AvatarFallback
                className={cn(
                    "bg-primary/10 text-primary text-sm font-semibold",
                    fallbackClassName
                )}
            >
                {getInitials(displayName)}
            </AvatarFallback>
        </Avatar>
    );
}
