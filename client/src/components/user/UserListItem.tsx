"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface UserListItemProps {
    user: {
        id: string;
        displayName: string;
        avatar?: string | null;
        bio?: string | null;
    };
    /** Optional action element (e.g. Follow button) rendered on the right. */
    action?: React.ReactNode;
    /** Extra info rendered below bio (e.g. follower count). */
    meta?: React.ReactNode;
}

export function UserListItem({ user, action, meta }: UserListItemProps) {
    return (
        <div className="flex items-center justify-between gap-3">
            <Link
                href={`/profile/${user.id}`}
                className="flex items-center gap-3 min-w-0"
            >
                <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {getInitials(user.displayName)}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">
                        {user.displayName}
                    </p>
                    {user.bio && (
                        <p className="text-xs text-muted-foreground truncate">
                            {user.bio}
                        </p>
                    )}
                    {meta}
                </div>
            </Link>
            {action}
        </div>
    );
}
