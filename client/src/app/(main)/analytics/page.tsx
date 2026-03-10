"use client";

import { useState } from "react";
import {
    TrendingUp,
    Users,
    FileText,
    Heart,
    MessageSquare,
    Repeat2,
    BarChart3,
    AlertTriangle,
    Shield,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useAppSelector } from "@/store/hooks";
import {
    useGetCreatorAnalyticsQuery,
    useGetAdminAnalyticsQuery,
} from "@/store/api/analyticsApi";
import type {
    PostPerformance,
    GrowthDataPoint,
    TrendingCommunity,
} from "@/store/api/analyticsApi";
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// ─── Stat Card ─────────────────────────────────────────────

function StatCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
}: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
    trend?: string;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-sm font-medium">
                    {title}
                </CardDescription>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
                {trend && (
                    <p className="text-xs text-green-600 mt-1">{trend}</p>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Follower Growth Chart ────────────────────────────────

function FollowerGrowthChart({ data }: { data: GrowthDataPoint[] }) {
    const formatted = data.map((d) => ({
        ...d,
        date: new Date(d.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        }),
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Follower Growth</CardTitle>
                <CardDescription>New followers per day</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={formatted}>
                            <defs>
                                <linearGradient
                                    id="followerGrad"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="hsl(var(--primary))"
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="hsl(var(--primary))"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-muted"
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11 }}
                                className="text-muted-foreground"
                            />
                            <YAxis
                                tick={{ fontSize: 11 }}
                                className="text-muted-foreground"
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor:
                                        "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="hsl(var(--primary))"
                                fill="url(#followerGrad)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Post Performance Table ───────────────────────────────

function PostPerformanceCards({ posts }: { posts: PostPerformance[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Post Performance</CardTitle>
                <CardDescription>
                    Your recent posts and their engagement
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {posts.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No published posts yet
                        </p>
                    )}
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                            <div className="flex-1 min-w-0 mr-4">
                                <p className="text-sm font-medium truncate">
                                    {post.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(
                                        post.createdAt
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Heart className="h-3 w-3" />
                                    {post._count.likes}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3" />
                                    {post._count.comments}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Repeat2 className="h-3 w-3" />
                                    {post._count.reposts}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Admin: User & Content Growth Charts ──────────────────

function GrowthChart({
    data,
    title,
    description,
    color,
}: {
    data: GrowthDataPoint[];
    title: string;
    description: string;
    color: string;
}) {
    const formatted = data.map((d) => ({
        ...d,
        date: new Date(d.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        }),
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={formatted}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-muted"
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10 }}
                                className="text-muted-foreground"
                            />
                            <YAxis
                                tick={{ fontSize: 11 }}
                                className="text-muted-foreground"
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor:
                                        "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                }}
                            />
                            <Bar
                                dataKey="count"
                                fill={color}
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Admin: Trending Communities ──────────────────────────

function TrendingCommunitiesList({
    communities,
}: {
    communities: TrendingCommunity[];
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">
                    Trending Communities
                </CardTitle>
                <CardDescription>Most active communities by posts</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {communities.map((community, index) => (
                        <div
                            key={community.id}
                            className="flex items-center justify-between p-3 rounded-lg border"
                        >
                            <div className="flex items-center gap-3">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                    {index + 1}
                                </span>
                                <div>
                                    <p className="text-sm font-medium">
                                        {community.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        /{community.slug}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <Badge variant="outline">
                                    {community._count.posts} posts
                                </Badge>
                                <Badge variant="outline">
                                    {community._count.members} members
                                </Badge>
                            </div>
                        </div>
                    ))}
                    {communities.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No communities yet
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Loading Skeleton ─────────────────────────────────────

function AnalyticsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
            </div>
            <Skeleton className="h-[350px] rounded-xl" />
            <Skeleton className="h-[300px] rounded-xl" />
        </div>
    );
}

// ─── Creator View ─────────────────────────────────────────

function CreatorView({ days }: { days: number }) {
    const { data, isLoading } = useGetCreatorAnalyticsQuery({ days });

    if (isLoading) return <AnalyticsSkeleton />;
    if (!data) return null;

    const { stats, postPerformance, followerGrowth } = data;

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Posts"
                    value={stats.postCount}
                    icon={FileText}
                />
                <StatCard
                    title="Total Likes"
                    value={stats.totalLikes}
                    icon={Heart}
                />
                <StatCard
                    title="Followers"
                    value={stats.followerCount}
                    icon={Users}
                />
                <StatCard
                    title="Engagement Rate"
                    value={`${stats.engagementRate}%`}
                    icon={TrendingUp}
                    description="Interactions per follower"
                />
            </div>

            {/* Charts */}
            <FollowerGrowthChart data={followerGrowth} />
            <PostPerformanceCards posts={postPerformance} />
        </div>
    );
}

// ─── Admin View ───────────────────────────────────────────

function AdminView({ days }: { days: number }) {
    const { data, isLoading } = useGetAdminAnalyticsQuery({ days });

    if (isLoading) return <AnalyticsSkeleton />;
    if (!data) return null;

    const { platformStats, userGrowth, contentGrowth, trendingCommunities } =
        data;

    return (
        <div className="space-y-6">
            {/* Platform Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Users"
                    value={platformStats.totalUsers}
                    icon={Users}
                    description={`${platformStats.activeUsers} active`}
                />
                <StatCard
                    title="Total Posts"
                    value={platformStats.totalPosts}
                    icon={FileText}
                />
                <StatCard
                    title="Flagged Rate"
                    value={`${platformStats.flaggedRatio}%`}
                    icon={AlertTriangle}
                    description={`${platformStats.flaggedPostCount} flagged posts`}
                />
                <StatCard
                    title="Moderation Actions"
                    value={platformStats.moderationActions}
                    icon={Shield}
                    description={`${platformStats.pendingReports} pending reports`}
                />
            </div>

            {/* Growth Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <GrowthChart
                    data={userGrowth}
                    title="User Growth"
                    description="New registrations per day"
                    color="hsl(var(--primary))"
                />
                <GrowthChart
                    data={contentGrowth}
                    title="Content Growth"
                    description="New posts per day"
                    color="hsl(210, 80%, 55%)"
                />
            </div>

            {/* Trending */}
            <TrendingCommunitiesList communities={trendingCommunities} />
        </div>
    );
}

// ─── Page ──────────────────────────────────────────────────

export default function AnalyticsPage() {
    const { user } = useAppSelector((state) => state.auth);
    const [days, setDays] = useState("30");
    const isAdmin = user?.role === "ADMIN";

    if (!user) {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <EmptyState
                    icon={BarChart3}
                    title="Login Required"
                    description="Please log in to view your analytics."
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-primary" />
                        Analytics
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track your performance and growth
                    </p>
                </div>
                <Select value={days} onValueChange={setDays}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="14">Last 14 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Tabs for Admin */}
            {isAdmin ? (
                <Tabs defaultValue="admin">
                    <TabsList>
                        <TabsTrigger value="admin">Platform</TabsTrigger>
                        <TabsTrigger value="creator">My Stats</TabsTrigger>
                    </TabsList>
                    <TabsContent value="admin" className="mt-4">
                        <AdminView days={parseInt(days, 10)} />
                    </TabsContent>
                    <TabsContent value="creator" className="mt-4">
                        <CreatorView days={parseInt(days, 10)} />
                    </TabsContent>
                </Tabs>
            ) : (
                <CreatorView days={parseInt(days, 10)} />
            )}
        </div>
    );
}
