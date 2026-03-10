"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "@/lib/date-utils";
import {
    Heart,
    MessageCircle,
    Repeat2,
    UserPlus,
    Bell,
    CheckCheck,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { NotificationSkeleton } from "@/components/ui/skeleton-patterns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import {
    useGetNotificationsQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
} from "@/store/api/notificationApi";
import type { Notification } from "@/store/api/notificationApi";
import { usePageTitle } from "@/hooks/usePageTitle";

/** Returns the appropriate icon for a notification type. */
function getNotificationIcon(type: Notification["type"]) {
    const iconMap = {
        LIKE: <Heart className="h-4 w-4 text-rose-500" />,
        COMMENT: <MessageCircle className="h-4 w-4 text-blue-500" />,
        FOLLOW: <UserPlus className="h-4 w-4 text-green-500" />,
        REPOST: <Repeat2 className="h-4 w-4 text-amber-500" />,
        MENTION: <Bell className="h-4 w-4 text-purple-500" />,
    };
    return iconMap[type] || <Bell className="h-4 w-4" />;
}

/** Returns the navigation path for a notification. */
function getNotificationLink(notification: Notification): string | null {
    if (!notification.referenceId || !notification.referenceType) return null;

    switch (notification.referenceType) {
        case "POST":
            return `/feed`; // Could link to /posts/:id if there's a post detail page
        case "USER":
            return `/profile/${notification.referenceId}`;
        default:
            return null;
    }
}

export default function NotificationsPage() {
    usePageTitle("Notifications");
    const router = useRouter();

    const { data, isLoading } = useGetNotificationsQuery();
    const [markAsRead] = useMarkAsReadMutation();
    const [markAllAsRead, { isLoading: isMarkingAll }] =
        useMarkAllAsReadMutation();

    const notifications = data?.items ?? [];
    const hasUnread = notifications.some((n) => !n.isRead);

    const handleNotificationClick = useCallback(
        async (notification: Notification) => {
            // Mark as read if not already
            if (!notification.isRead) {
                try {
                    await markAsRead(notification.id).unwrap();
                } catch {
                    // handled
                }
            }

            // Navigate to referenced content
            const link = getNotificationLink(notification);
            if (link) {
                router.push(link);
            }
        },
        [markAsRead, router]
    );

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead().unwrap();
        } catch {
            // handled
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Notifications
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Stay up to date with activity on your content
                    </p>
                </div>
                {hasUnread && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={handleMarkAllAsRead}
                        disabled={isMarkingAll}
                    >
                        {isMarkingAll ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <CheckCheck className="h-4 w-4" />
                        )}
                        Mark all as read
                    </Button>
                )}
            </div>

            {isLoading && <NotificationSkeleton count={5} />}

            {/* Notification List */}
            {!isLoading && notifications.length > 0 && (
                <div className="rounded-xl border bg-card divide-y">
                    {notifications.map((notification) => (
                        <button
                            key={notification.id}
                            onClick={() =>
                                handleNotificationClick(notification)
                            }
                            className={cn(
                                "flex items-start gap-3 p-4 w-full text-left transition-colors hover:bg-muted/50",
                                !notification.isRead && "bg-primary/5"
                            )}
                        >
                            {/* Icon */}
                            <div className="flex-shrink-0 mt-0.5">
                                {getNotificationIcon(notification.type)}
                            </div>

                            {/* Actor avatar */}
                            <Avatar className="h-9 w-9 flex-shrink-0">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                    {getInitials(notification.actor.displayName)}
                                </AvatarFallback>
                            </Avatar>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm">
                                    <span className="font-medium">
                                        {notification.actor.displayName}
                                    </span>{" "}
                                    <span className="text-muted-foreground">
                                        {notification.message}
                                    </span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(notification.createdAt)}
                                </p>
                            </div>

                            {/* Unread indicator */}
                            {!notification.isRead && (
                                <div className="mt-2 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && notifications.length === 0 && (
                <EmptyState
                    icon={Bell}
                    title="No notifications yet"
                    description="When someone interacts with your content, you will see it here."
                />
            )}
        </div>
    );
}
