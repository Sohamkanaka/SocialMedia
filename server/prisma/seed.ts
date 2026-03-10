import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// ─── Seed Data Script ─────────────────────────────────────
// Creates demo data for development/demo purposes.

async function main() {
    console.log("Seeding database...");

    // ─── Clean Existing Data ──────────────────────────────
    await prisma.auditLog.deleteMany();
    await prisma.dataExport.deleteMany();
    await prisma.systemSetting.deleteMany();
    await prisma.moderationAction.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.report.deleteMany();
    await prisma.pollVote.deleteMany();
    await prisma.pollOption.deleteMany();
    await prisma.repost.deleteMany();
    await prisma.bookmark.deleteMany();
    await prisma.like.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.communityMember.deleteMany();
    await prisma.post.deleteMany();
    await prisma.community.deleteMany();
    await prisma.user.deleteMany();

    console.log("Cleaned existing data.");

    // ─── Users ────────────────────────────────────────────
    const passwordHash = await bcrypt.hash("password123", 10);

    const admin = await prisma.user.create({
        data: {
            email: "admin@community.dev",
            password: passwordHash,
            displayName: "Admin User",
            role: "ADMIN",
            bio: "Platform administrator",
        },
    });

    const moderator = await prisma.user.create({
        data: {
            email: "moderator@community.dev",
            password: passwordHash,
            displayName: "Mod Smith",
            role: "MODERATOR",
            bio: "Community moderator keeping things safe",
        },
    });

    const alice = await prisma.user.create({
        data: {
            email: "alice@community.dev",
            password: passwordHash,
            displayName: "Alice Johnson",
            role: "USER",
            bio: "Tech enthusiast and writer",
        },
    });

    const bob = await prisma.user.create({
        data: {
            email: "bob@community.dev",
            password: passwordHash,
            displayName: "Bob Williams",
            role: "USER",
            bio: "Designer and creative thinker",
        },
    });

    const carol = await prisma.user.create({
        data: {
            email: "carol@community.dev",
            password: passwordHash,
            displayName: "Carol Davis",
            role: "USER",
            bio: "Full-stack developer",
        },
    });

    const users = [admin, moderator, alice, bob, carol];
    console.log(`Created ${users.length} users.`);

    // ─── Follows ──────────────────────────────────────────
    const followPairs = [
        [alice.id, bob.id],
        [alice.id, carol.id],
        [alice.id, admin.id],
        [bob.id, alice.id],
        [bob.id, carol.id],
        [carol.id, alice.id],
        [carol.id, bob.id],
        [carol.id, moderator.id],
        [moderator.id, alice.id],
        [admin.id, alice.id],
        [admin.id, bob.id],
    ];

    for (const [followerId, followingId] of followPairs) {
        await prisma.follow.create({
            data: { followerId, followingId },
        });
    }
    console.log(`Created ${followPairs.length} follows.`);

    // ─── Communities ──────────────────────────────────────
    const techCommunity = await prisma.community.create({
        data: {
            name: "Tech Talk",
            slug: "tech-talk",
            description: "Discuss the latest in technology",
            creatorId: alice.id,
        },
    });

    const designCommunity = await prisma.community.create({
        data: {
            name: "Design Hub",
            slug: "design-hub",
            description: "Creative design discussions",
            creatorId: bob.id,
        },
    });

    const devCommunity = await prisma.community.create({
        data: {
            name: "Dev Community",
            slug: "dev-community",
            description: "Programming and software development",
            creatorId: carol.id,
        },
    });

    // Community memberships
    const memberData = [
        { userId: alice.id, communityId: techCommunity.id },
        { userId: bob.id, communityId: techCommunity.id },
        { userId: carol.id, communityId: techCommunity.id },
        { userId: bob.id, communityId: designCommunity.id },
        { userId: alice.id, communityId: designCommunity.id },
        { userId: carol.id, communityId: devCommunity.id },
        { userId: alice.id, communityId: devCommunity.id },
        { userId: moderator.id, communityId: techCommunity.id },
    ];

    for (const m of memberData) {
        await prisma.communityMember.create({ data: m });
    }
    console.log("Created 3 communities with members.");

    // ─── Posts ─────────────────────────────────────────────
    const posts = await Promise.all([
        prisma.post.create({
            data: {
                title: "Welcome to the Community Platform",
                content: "This is a demo post to showcase the platform features. Feel free to explore!",
                authorId: admin.id,
                status: "PUBLISHED",
                publishedAt: new Date(),
            },
        }),
        prisma.post.create({
            data: {
                title: "Getting Started with TypeScript",
                content: "TypeScript adds static typing to JavaScript, making your code more robust and maintainable.",
                authorId: alice.id,
                communityId: techCommunity.id,
                status: "PUBLISHED",
                publishedAt: new Date(Date.now() - 86400000),
            },
        }),
        prisma.post.create({
            data: {
                title: "Design Trends in 2026",
                content: "Glassmorphism continues to evolve with new techniques and approaches.",
                authorId: bob.id,
                communityId: designCommunity.id,
                status: "PUBLISHED",
                publishedAt: new Date(Date.now() - 172800000),
            },
        }),
        prisma.post.create({
            data: {
                title: "Building REST APIs with Express",
                content: "A guide to building scalable REST APIs using Express.js and TypeScript with Prisma ORM.",
                authorId: carol.id,
                communityId: devCommunity.id,
                status: "PUBLISHED",
                publishedAt: new Date(Date.now() - 259200000),
            },
        }),
        prisma.post.create({
            data: {
                title: "React Server Components Explained",
                content: "Understanding the benefits and use cases of React Server Components in Next.js applications.",
                authorId: alice.id,
                communityId: techCommunity.id,
                status: "PUBLISHED",
                publishedAt: new Date(Date.now() - 345600000),
            },
        }),
        prisma.post.create({
            data: {
                title: "CSS Grid vs Flexbox",
                content: "When to use CSS Grid and when to use Flexbox for your layouts.",
                authorId: bob.id,
                communityId: designCommunity.id,
                status: "PUBLISHED",
                publishedAt: new Date(Date.now() - 432000000),
            },
        }),
        prisma.post.create({
            data: {
                title: "Database Optimization Tips",
                content: "Practical tips for optimizing database queries and indexing strategies.",
                authorId: carol.id,
                communityId: devCommunity.id,
                status: "PUBLISHED",
                publishedAt: new Date(Date.now() - 518400000),
            },
        }),
        prisma.post.create({
            data: {
                title: "My Draft Post",
                content: "This is a draft post that has not been published yet.",
                authorId: alice.id,
                status: "DRAFT",
            },
        }),
        prisma.post.create({
            data: {
                title: "Prisma ORM Best Practices",
                content: "How to structure your Prisma schema and queries for maximum performance.",
                authorId: carol.id,
                communityId: devCommunity.id,
                status: "PUBLISHED",
                publishedAt: new Date(Date.now() - 604800000),
            },
        }),
        prisma.post.create({
            data: {
                title: "The Future of Web Development",
                content: "Exploring upcoming trends and technologies that will shape web development.",
                authorId: alice.id,
                communityId: techCommunity.id,
                status: "PUBLISHED",
                publishedAt: new Date(Date.now() - 691200000),
            },
        }),
        prisma.post.create({
            data: {
                title: "Accessibility in Modern Web Apps",
                content: "Making your web applications accessible to everyone. ARIA labels, keyboard navigation, and more.",
                authorId: bob.id,
                status: "PUBLISHED",
                publishedAt: new Date(Date.now() - 777600000),
            },
        }),
        prisma.post.create({
            data: {
                title: "Moderation Best Practices",
                content: "How to effectively moderate online communities and handle edge cases.",
                authorId: moderator.id,
                status: "PUBLISHED",
                publishedAt: new Date(Date.now() - 864000000),
            },
        }),
    ]);

    console.log(`Created ${posts.length} posts.`);

    // ─── Comments ─────────────────────────────────────────
    const comments = await Promise.all([
        prisma.comment.create({
            data: {
                content: "Great post! Very informative.",
                authorId: bob.id,
                postId: posts[1].id,
            },
        }),
        prisma.comment.create({
            data: {
                content: "Thanks for sharing this!",
                authorId: carol.id,
                postId: posts[1].id,
            },
        }),
        prisma.comment.create({
            data: {
                content: "Love the design trends overview!",
                authorId: alice.id,
                postId: posts[2].id,
            },
        }),
        prisma.comment.create({
            data: {
                content: "This is exactly what I was looking for.",
                authorId: alice.id,
                postId: posts[3].id,
            },
        }),
        prisma.comment.create({
            data: {
                content: "Could you elaborate on the indexing strategies?",
                authorId: bob.id,
                postId: posts[6].id,
            },
        }),
    ]);
    console.log(`Created ${comments.length} comments.`);

    // ─── Likes ────────────────────────────────────────────
    const likePairs = [
        [alice.id, posts[2].id],
        [alice.id, posts[3].id],
        [alice.id, posts[6].id],
        [bob.id, posts[1].id],
        [bob.id, posts[4].id],
        [bob.id, posts[8].id],
        [carol.id, posts[0].id],
        [carol.id, posts[1].id],
        [carol.id, posts[2].id],
        [carol.id, posts[5].id],
        [admin.id, posts[1].id],
        [admin.id, posts[3].id],
        [moderator.id, posts[0].id],
        [moderator.id, posts[4].id],
    ];

    for (const [userId, postId] of likePairs) {
        await prisma.like.create({ data: { userId, postId } });
    }
    console.log(`Created ${likePairs.length} likes.`);

    // ─── Reports ──────────────────────────────────────────
    await prisma.report.create({
        data: {
            reporterId: bob.id,
            targetType: "POST",
            targetId: posts[10].id,
            reason: "SPAM",
            status: "PENDING",
        },
    });

    await prisma.report.create({
        data: {
            reporterId: carol.id,
            targetType: "POST",
            targetId: posts[10].id,
            reason: "MISINFORMATION",
            status: "PENDING",
        },
    });
    console.log("Created 2 reports.");

    // ─── Moderation Actions ──────────────────────────────
    await prisma.moderationAction.create({
        data: {
            actionType: "WARN_USER",
            targetUserId: carol.id,
            performedBy: moderator.id,
            reason: "Minor content policy violation",
        },
    });
    console.log("Created 1 moderation action.");

    // ─── System Settings ─────────────────────────────────
    const defaultSettings = [
        { key: "risk_threshold_high", value: "70", label: "High Risk Threshold", category: "moderation" },
        { key: "risk_threshold_medium", value: "40", label: "Medium Risk Threshold", category: "moderation" },
        { key: "auto_flag_categories", value: "HATE_SPEECH,NSFW", label: "Auto-flag Categories", category: "moderation" },
        { key: "rate_limit_posts", value: "50", label: "Posts per Hour", category: "rate_limits" },
        { key: "rate_limit_comments", value: "100", label: "Comments per Hour", category: "rate_limits" },
        { key: "data_retention_days", value: "365", label: "Data Retention (days)", category: "retention" },
        { key: "export_expiry_hours", value: "24", label: "Export Expiry (hours)", category: "retention" },
    ];

    for (const setting of defaultSettings) {
        await prisma.systemSetting.create({ data: setting });
    }
    console.log(`Created ${defaultSettings.length} system settings.`);

    // ─── Audit Logs ──────────────────────────────────────
    await prisma.auditLog.create({
        data: {
            userId: admin.id,
            action: "SYSTEM_SETTINGS_UPDATED",
            entityType: "SystemSetting",
            metadata: JSON.stringify({ updatedKeys: ["risk_threshold_high", "risk_threshold_medium"] }),
        },
    });

    await prisma.auditLog.create({
        data: {
            userId: admin.id,
            action: "USER_ROLE_CHANGED",
            entityType: "User",
            entityId: moderator.id,
            metadata: JSON.stringify({ previousRole: "USER", newRole: "MODERATOR" }),
        },
    });
    console.log("Created 2 audit log entries.");

    // ─── Notifications ───────────────────────────────────
    await prisma.notification.create({
        data: {
            userId: alice.id,
            actorId: bob.id,
            type: "LIKE",
            message: "Bob Williams liked your post",
            referenceId: posts[1].id,
            referenceType: "post",
        },
    });

    await prisma.notification.create({
        data: {
            userId: alice.id,
            actorId: carol.id,
            type: "COMMENT",
            message: "Carol Davis commented on your post",
            referenceId: posts[1].id,
            referenceType: "post",
        },
    });

    await prisma.notification.create({
        data: {
            userId: bob.id,
            actorId: alice.id,
            type: "FOLLOW",
            message: "Alice Johnson started following you",
        },
    });
    console.log("Created 3 notifications.");

    console.log("\nSeed completed successfully!");
    console.log("\nDemo accounts (password: password123):");
    console.log("  Admin:     admin@community.dev");
    console.log("  Moderator: moderator@community.dev");
    console.log("  User:      alice@community.dev");
    console.log("  User:      bob@community.dev");
    console.log("  User:      carol@community.dev");
}

main()
    .catch((e) => {
        console.error("Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
