import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/post.routes.js";
import userRoutes from "./routes/user.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import communityRoutes from "./routes/community.routes.js";
import searchRoutes from "./routes/search.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import reportRoutes from "./routes/report.routes.js";
import moderationRoutes from "./routes/moderation.routes.js";
import suspensionRoutes from "./routes/suspension.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import complianceRoutes from "./routes/compliance.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";
import { prisma } from "./lib/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Global Middleware ─────────────────────────────────────

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static Files (local uploads) ──────────────────────────

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/exports", express.static(path.join(__dirname, "../exports")));

// ─── Health Check ──────────────────────────────────────────

app.get("/api/health", async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ success: true, message: "Server is running", db: "connected" });
    } catch {
        res.status(503).json({ success: false, message: "Server is running", db: "disconnected" });
    }
});

// ─── Routes ────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/posts", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/moderation", moderationRoutes);
app.use("/api/users", suspensionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/compliance", complianceRoutes);
app.use("/api/admin", adminRoutes);

// ─── Global Error Handler (must be last) ───────────────────

app.use(globalErrorHandler);

// ─── Start Server ──────────────────────────────────────────

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// ─── Graceful Shutdown ─────────────────────────────────────

const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
        await prisma.$disconnect();
        console.log("Server closed. Database disconnected.");
        process.exit(0);
    });

    // Force exit after 10 seconds if graceful shutdown fails
    setTimeout(() => {
        console.error("Forced shutdown — could not close connections in time.");
        process.exit(1);
    }, 10_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default app;

