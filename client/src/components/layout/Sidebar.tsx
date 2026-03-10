"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Users,
    Shield,
    Settings,
    LogOut,
    Menu,
    X,
    MessageSquare,
    BarChart3,
    PenSquare,
    User,
    Rss,
    LayoutList,
    Compass,
    Bell,
    TrendingUp,
    FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "./ThemeToggle";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { useGetUnreadCountQuery } from "@/store/api/notificationApi";
import { useState } from "react";
import { cn, getInitials } from "@/lib/utils";

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: string[];
    requiresAuth?: boolean;
    group?: string;
}

const navItems: NavItem[] = [
    { label: "Feed", href: "/feed", icon: Rss, requiresAuth: true, group: "Main" },
    { label: "Create Post", href: "/create", icon: PenSquare, requiresAuth: true, group: "Main" },
    { label: "Notifications", href: "/notifications", icon: Bell, requiresAuth: true, group: "Main" },

    { label: "Explore", href: "/explore", icon: Compass, group: "Discover" },
    { label: "Communities", href: "/communities", icon: Users, group: "Discover" },
    { label: "My Posts", href: "/my-posts", icon: LayoutList, requiresAuth: true, group: "Discover" },

    { label: "Moderation", href: "/moderation", icon: Shield, requiresAuth: true, roles: ["MODERATOR", "ADMIN"], group: "Management" },
    { label: "Reports", href: "/reports", icon: BarChart3, requiresAuth: true, roles: ["ADMIN"], group: "Management" },
    { label: "Analytics", href: "/analytics", icon: TrendingUp, requiresAuth: true, group: "Management" },
    { label: "Compliance", href: "/compliance", icon: FileText, requiresAuth: true, group: "Management" },
    { label: "Admin", href: "/admin", icon: Settings, requiresAuth: true, roles: ["ADMIN"], group: "Management" },
];

export function Sidebar() {
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { data: unreadCount } = useGetUnreadCountQuery(undefined, {
        skip: !isAuthenticated,
        pollingInterval: 30000, // Poll every 30 seconds
    });

    const filteredNav = navItems.filter((item) => {
        if (item.requiresAuth && !isAuthenticated) return false;
        if (item.roles) {
            if (!user) return false;
            return item.roles.includes(user.role);
        }
        return true;
    });

    const handleLogout = () => {
        dispatch(logout());
        setIsMobileOpen(false);
    };

    const sidebarContent = (
        <div className="flex h-full flex-col">
            {/* Logo / Brand */}
            <div className="flex h-16 items-center gap-3 px-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                    C
                </div>
                <span className="text-lg font-semibold tracking-tight">Community</span>
            </div>

            <Separator />

            {/* Navigation */}
            <nav className="flex-1 space-y-6 px-3 py-4 overflow-y-auto">
                {Object.entries(
                    filteredNav.reduce((acc, item) => {
                        const group = item.group || "Navigation";
                        if (!acc[group]) acc[group] = [];
                        acc[group].push(item);
                        return acc;
                    }, {} as Record<string, typeof filteredNav>)
                ).map(([groupName, items]) => (
                    <div key={groupName} className="space-y-1">
                        <h4 className="px-3 pb-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                            {groupName}
                        </h4>
                        {items.map((item) => {
                            const isActive = pathname === item.href;
                            const isNotifications = item.href === "/notifications";
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-sm scale-[0.98]"
                                            : "text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground active:scale-95"
                                    )}
                                >
                                    <item.icon className="h-4 w-4 flex-shrink-0" />
                                    {item.label}
                                    {isNotifications && unreadCount && unreadCount > 0 ? (
                                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 shadow-sm">
                                            {unreadCount > 99 ? "99+" : unreadCount}
                                        </span>
                                    ) : null}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            <Separator />

            {/* Bottom Section */}
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <ThemeToggle />
                </div>

                {isAuthenticated && user && (
                    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {getInitials(user.displayName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {user.displayName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {user.role}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={handleLogout}
                            aria-label="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {!isAuthenticated && (
                    <div className="space-y-2">
                        <Link href="/login" onClick={() => setIsMobileOpen(false)}>
                            <Button variant="outline" className="w-full">
                                Log In
                            </Button>
                        </Link>
                        <Link href="/signup" onClick={() => setIsMobileOpen(false)}>
                            <Button className="w-full">Sign Up</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header */}
            <div className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 lg:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 -ml-2"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    aria-label="Toggle menu"
                >
                    {isMobileOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </Button>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
                    C
                </div>
                <span className="font-semibold">Community</span>
            </div>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 bg-background border-r transition-transform duration-300 ease-in-out lg:hidden",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {sidebarContent}
            </aside>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-background/95 backdrop-blur-sm">
                {sidebarContent}
            </aside>
        </>
    );
}
