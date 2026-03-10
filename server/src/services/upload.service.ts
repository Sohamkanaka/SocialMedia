import { AppError } from "../middleware/errorHandler.js";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

// ─── Upload Service ───────────────────────────────────────
// Handles file uploads. Uses local storage as default.
// Can be extended with S3 integration when AWS credentials are provided.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, "../../uploads");

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
    try {
        await fs.access(UPLOADS_DIR);
    } catch {
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
    }
};

// Allowed file types
const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/quicktime",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const uploadFile = async (file: Express.Multer.File): Promise<string> => {
    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new AppError(
            `File type ${file.mimetype} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
            400
        );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        throw new AppError("File size exceeds 10MB limit", 400);
    }

    // Check if S3 is configured
    const hasS3Config =
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        process.env.AWS_S3_BUCKET;

    if (hasS3Config) {
        return uploadToS3(file);
    }

    return uploadToLocal(file);
};

// ─── Local Upload ──────────────────────────────────────────

const uploadToLocal = async (file: Express.Multer.File): Promise<string> => {
    await ensureUploadsDir();

    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${ext}`;
    const filepath = path.join(UPLOADS_DIR, filename);

    await fs.writeFile(filepath, file.buffer);

    // Return a URL path that can be served statically
    const baseUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    return `${baseUrl}/uploads/${filename}`;
};

// ─── S3 Upload (stub — activated when AWS credentials are set) ──

const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
    try {
        const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

        const s3 = new S3Client({
            region: process.env.AWS_REGION || "us-east-1",
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
        });

        const ext = path.extname(file.originalname);
        const key = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 15)}${ext}`;

        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET!,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            })
        );

        return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;
    } catch (error) {
        console.error("S3 upload error:", error);
        throw new AppError("Failed to upload file to S3", 500);
    }
};
