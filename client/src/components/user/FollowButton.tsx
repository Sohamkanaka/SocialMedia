"use client";

import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFollowUserMutation, useUnfollowUserMutation } from "@/store/api/userApi";
import { useAppSelector } from "@/store/hooks";

interface FollowButtonProps {
    userId: string;
    isFollowing: boolean;
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
}

export function FollowButton({
    userId,
    isFollowing,
    variant,
    size = "sm",
    className = "gap-2",
}: FollowButtonProps) {
    const { user: currentUser } = useAppSelector((state) => state.auth);
    const [followUser, { isLoading: isFollowingLoading }] = useFollowUserMutation();
    const [unfollowUser, { isLoading: isUnfollowingLoading }] = useUnfollowUserMutation();

    // Don't show button for own profile
    if (currentUser?.id === userId) {
        return null;
    }

    const isLoading = isFollowingLoading || isUnfollowingLoading;

    const handleFollowToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            if (isFollowing) {
                await unfollowUser(userId).unwrap();
            } else {
                await followUser(userId).unwrap();
            }
        } catch {
            // Error handled by RTK Query
        }
    };

    const buttonVariant = variant || (isFollowing ? "outline" : "default");

    return (
        <Button
            variant={buttonVariant}
            size={size}
            className={className}
            onClick={handleFollowToggle}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : isFollowing ? (
                <UserMinus className="h-4 w-4" />
            ) : (
                <UserPlus className="h-4 w-4" />
            )}
            {isFollowing ? "Unfollow" : "Follow"}
        </Button>
    );
}
