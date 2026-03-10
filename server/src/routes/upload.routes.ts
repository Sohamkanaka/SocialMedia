import { Router } from "express";
import multer from "multer";
import * as uploadController from "../controllers/upload.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Allowed MIME types for file uploads
const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/quicktime",
];

// Configure multer for memory storage with file type filter
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`File type ${file.mimetype} is not allowed`));
        }
    },
});

// POST /api/upload — Upload a file
router.post("/", authenticate, upload.single("file"), uploadController.uploadFile);

export default router;
