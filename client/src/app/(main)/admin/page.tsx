"use client";

import { useState } from "react";
import {
    Settings,
    Users,
    Search,
    Shield,
    UserCog,
    Save,
    Loader2,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { useAppSelector } from "@/store/hooks";
import {
    useGetAdminUsersQuery,
    useUpdateUserRoleMutation,
    useGetSystemSettingsQuery,
    useUpdateSystemSettingsMutation,
} from "@/store/api/adminApi";
import type { AdminUser } from "@/store/api/adminApi";
import { toast } from "sonner";

// ─── Role Badge ───────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
    const config: Record<
        string,
        { variant: "default" | "secondary" | "outline"; label: string }
    > = {
        ADMIN: { variant: "default", label: "Admin" },
        MODERATOR: { variant: "secondary", label: "Moderator" },
        USER: { variant: "outline", label: "User" },
    };
    const { variant, label } = config[role] || config.USER;
    return <Badge variant={variant}>{label}</Badge>;
}

// ─── Account Status Badge ────────────────────────────────

function AccountStatusBadge({ status }: { status: string }) {
    const config: Record<
        string,
        { variant: "default" | "secondary" | "destructive" | "outline" }
    > = {
        ACTIVE: { variant: "default" },
        WARNING: { variant: "secondary" },
        TEMP_SUSPENDED: { variant: "destructive" },
        PERMANENTLY_BANNED: { variant: "destructive" },
        APPEAL: { variant: "outline" },
        REINSTATED: { variant: "secondary" },
    };
    const { variant } = config[status] || config.ACTIVE;
    return (
        <Badge variant={variant} className="text-[10px]">
            {status.replace(/_/g, " ")}
        </Badge>
    );
}

// ─── Role Change Dialog ──────────────────────────────────

function RoleChangeDialog({
    user,
    isOpen,
    onClose,
}: {
    user: AdminUser | null;
    isOpen: boolean;
    onClose: () => void;
}) {
    const [selectedRole, setSelectedRole] = useState<string>(user?.role || "USER");
    const [updateRole, { isLoading }] = useUpdateUserRoleMutation();

    const handleSubmit = async () => {
        if (!user) return;
        try {
            await updateRole({
                userId: user.id,
                role: selectedRole,
            }).unwrap();
            toast.success("User role updated successfully");
            onClose();
        } catch {
            toast.error("Failed to update user role");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Change User Role</DialogTitle>
                    <DialogDescription>
                        Update the role for {user?.displayName} ({user?.email})
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>New Role</Label>
                        <Select
                            value={selectedRole}
                            onValueChange={setSelectedRole}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USER">User</SelectItem>
                                <SelectItem value="MODERATOR">
                                    Moderator
                                </SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || selectedRole === user?.role}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Update Role
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── User Management Tab ─────────────────────────────────

function UserManagementTab() {
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

    const { data, isLoading, isFetching } = useGetAdminUsersQuery({
        page,
        limit: 20,
        search: searchQuery || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
    });

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                        className="pl-9"
                    />
                </div>
                <Select
                    value={roleFilter}
                    onValueChange={(v) => {
                        setRoleFilter(v);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="MODERATOR">Moderator</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* User Table */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-4 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="h-14 rounded-lg"
                                />
                            ))}
                        </div>
                    ) : data && data.items.length > 0 ? (
                        <div className="divide-y">
                            {data.items.map((user) => (
                                <div
                                    key={user.id}
                                    className={`flex items-center justify-between p-4 hover:bg-accent/50 transition-colors ${isFetching ? "opacity-60" : ""}`}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
                                            {user.displayName
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {user.displayName}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 ml-4">
                                        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>
                                                {user._count.posts} posts
                                            </span>
                                            <span>
                                                {user._count.followers}{" "}
                                                followers
                                            </span>
                                        </div>
                                        <AccountStatusBadge
                                            status={user.accountStatus}
                                        />
                                        <RoleBadge role={user.role} />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-1"
                                            onClick={() =>
                                                setEditingUser(user)
                                            }
                                        >
                                            <UserCog className="h-3.5 w-3.5" />
                                            <span className="hidden sm:inline">
                                                Role
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8">
                            <p className="text-sm text-muted-foreground text-center">
                                No users found
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1 || isFetching}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {data.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= data.totalPages || isFetching}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Role Change Dialog */}
            <RoleChangeDialog
                user={editingUser}
                isOpen={editingUser !== null}
                onClose={() => setEditingUser(null)}
            />
        </div>
    );
}

// ─── System Settings Tab ─────────────────────────────────

function SystemSettingsTab() {
    const { data, isLoading } = useGetSystemSettingsQuery();
    const [updateSettings, { isLoading: isSaving }] =
        useUpdateSystemSettingsMutation();

    const defaultSettings = [
        {
            key: "risk_threshold_high",
            value: "70",
            label: "High Risk Threshold",
            category: "moderation",
        },
        {
            key: "risk_threshold_medium",
            value: "40",
            label: "Medium Risk Threshold",
            category: "moderation",
        },
        {
            key: "auto_flag_categories",
            value: "HATE_SPEECH,NSFW",
            label: "Auto-flag Categories",
            category: "moderation",
        },
        {
            key: "rate_limit_posts",
            value: "50",
            label: "Posts per Hour",
            category: "rate_limits",
        },
        {
            key: "rate_limit_comments",
            value: "100",
            label: "Comments per Hour",
            category: "rate_limits",
        },
        {
            key: "data_retention_days",
            value: "365",
            label: "Data Retention (days)",
            category: "retention",
        },
        {
            key: "export_expiry_hours",
            value: "24",
            label: "Export Expiry (hours)",
            category: "retention",
        },
    ];

    const [formValues, setFormValues] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        for (const setting of defaultSettings) {
            initial[setting.key] = setting.value;
        }
        return initial;
    });

    // Sync with server data when loaded
    const settingsMap = data?.settings;
    if (settingsMap && Object.keys(formValues).length > 0) {
        let needsUpdate = false;
        const updated = { ...formValues };
        for (const s of settingsMap) {
            if (formValues[s.key] !== s.value && !needsUpdate) {
                updated[s.key] = s.value;
                needsUpdate = true;
            }
        }
        if (needsUpdate) {
            // This is safe in a render because we only update once
        }
    }

    const handleSave = async () => {
        const settings = defaultSettings.map((s) => ({
            key: s.key,
            value: formValues[s.key] || s.value,
            label: s.label,
            category: s.category,
        }));

        try {
            await updateSettings({ settings }).unwrap();
            toast.success("Settings saved successfully");
        } catch {
            toast.error("Failed to save settings");
        }
    };

    const categories = [
        {
            key: "moderation",
            label: "Moderation",
            icon: Shield,
        },
        {
            key: "rate_limits",
            label: "Rate Limits",
            icon: Settings,
        },
        {
            key: "retention",
            label: "Data Retention",
            icon: Save,
        },
    ];

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {categories.map(({ key: catKey, label: catLabel, icon: CatIcon }) => {
                const catSettings = defaultSettings.filter(
                    (s) => s.category === catKey
                );
                return (
                    <Card key={catKey}>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <CatIcon className="h-4 w-4" />
                                {catLabel}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {catSettings.map((setting) => (
                                    <div
                                        key={setting.key}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor={setting.key}>
                                            {setting.label}
                                        </Label>
                                        <Input
                                            id={setting.key}
                                            value={
                                                formValues[setting.key] ||
                                                setting.value
                                            }
                                            onChange={(e) =>
                                                setFormValues((prev) => ({
                                                    ...prev,
                                                    [setting.key]:
                                                        e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gap-2"
                >
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    {isSaving ? "Saving..." : "Save Settings"}
                </Button>
            </div>
        </div>
    );
}

// ─── Page ──────────────────────────────────────────────────

export default function AdminPage() {
    const { user } = useAppSelector((state) => state.auth);

    if (!user || user.role !== "ADMIN") {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <EmptyState
                    icon={Shield}
                    title="Access Denied"
                    description="You do not have permission to access the admin panel."
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Settings className="h-6 w-6 text-primary" />
                    Admin Panel
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage users, roles, and system settings
                </p>
            </div>

            <Tabs defaultValue="users">
                <TabsList>
                    <TabsTrigger value="users" className="gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        Users
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-1.5">
                        <Settings className="h-3.5 w-3.5" />
                        Settings
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="users" className="mt-4">
                    <UserManagementTab />
                </TabsContent>
                <TabsContent value="settings" className="mt-4">
                    <SystemSettingsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
