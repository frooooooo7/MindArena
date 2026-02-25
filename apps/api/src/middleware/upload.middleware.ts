import multer from "multer";

// Multer memory storage configuration
const storage = multer.memoryStorage();

// Multer filter to reject non-images immediately (Header check only)
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed."));
    }
};

// Export pre-configured multer middleware for routes
export const uploadMiddleware = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB max
    },
    fileFilter,
});
