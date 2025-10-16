import multer from "multer";
import path, { dirname } from "path";
import fs from "fs";
import type { NextFunction, Request, Response } from "express";
import { fileURLToPath } from "url";
import { Readable } from "stream";
import cloudinaryCloud from "../configs/cloudinary.js";
import cloudinary from "cloudinary";

// Ensure upload folder exists
const __dirname = dirname(fileURLToPath(import.meta.url));

// used to remote upload to store in buffer for metdata validation
const uploadBuffer = multer({ storage: multer.memoryStorage() });

interface LocalFileUploadOptions {
    destination?: string;
    maxSizeLimit?: number;
}

declare global {
    namespace Express {
        interface Request {
            cloudinary?: cloudinary.UploadApiResponse;
        }
    }
}
export const createLocalImageUploader = (options?: LocalFileUploadOptions) => {
    const uploadDir = options?.destination
        ? path.resolve(__dirname, options.destination)
        : path.join(__dirname, "..", "uploads");

    const maxFileSize = options?.maxSizeLimit ? options.maxSizeLimit : 1 * 1024 * 1024;

    const storage = multer.diskStorage({
        destination: (req: Request, file: Express.Multer.File, cb) => {
            // make sure the directory exists
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req: Request, file: Express.Multer.File, cb) => {
            // Save with timestamp + original extension
            const uniqueSuffix = Date.now() + path.extname(file.originalname);
            cb(null, uniqueSuffix);
        },
    });
    const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        // Check mimetype first
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are supported"));
        }

        // Multer doesn't have access to file.size here yet; size check done elsewhere (see below)
        cb(null, true);
    };

    return multer({
        storage,
        fileFilter,
        limits: { fileSize: maxFileSize },
    }).single("image");
};

export const createRemoteImageUploader = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    uploadBuffer.single("image")(req, res, (error) => {
        if (error) {
            next(error);
        }
        if (!req.file) {
            // No image uploaded, just continue
            return next();
        }
        if (req.file && req.file.size > 2 * 1024 * 1024) {
            // 2MB
            return next(new Error("File too large"));
        }

        try {
            const fileStream = Readable.from(req.file.buffer);
            const cloudStream = cloudinaryCloud.uploader.upload_stream(
                {
                    folder: "post_images",
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) return next(error);
                    if (!result) return next(new Error("Cloudinary upload failed"));
                    req.cloudinary = result;
                    next();
                }
            );
            fileStream.pipe(cloudStream);
        } catch (error) {
            console.log("Middleware", error);
            next(error);
        }
    });
};
