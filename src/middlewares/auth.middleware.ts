import type { Request, NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import type mongoose from "mongoose";
import { AppError } from "../libs/customError.js";
import Session from "../models/session.model.js";
import User from "../models/user.model.js";

export interface JWTPayload extends jwt.JwtPayload {
    id: mongoose.Types.ObjectId;
    jti: string;
    email: string;
    iat?: number;
    exp?: number;
}

declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
            token?: string;
        }
    }
}

export const AuthenticateAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extract & validate header
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            throw new AppError("Authorization header missing or malformed", 401, "AUTH_MIDDLEWARE");
        }
        const token = authHeader.split(" ")[1];
        if (!token) throw new AppError("Access token missing", 401, "AUTH_MIDDLEWARE");

        const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
        if (!JWT_ACCESS_SECRET) throw new Error("JWT_ACCESS_SECRET not configured");

        const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as JWTPayload;
        req.user = decoded;

        const session = await Session.findOne({
            userId: req.user.id,
            jti: req.user.jti,
            valid: true,
        });
        if (!session) {
            throw new AppError("Invalid Session", 401, "AUTH_MIDDLEWARE");
        }
        next();
    } catch (error: any) {
        console.error(`[AUTH FAILURE]:`, error);

        // 4️⃣ Specific JWT error handling
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: "Token expired" });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // Custom AppError handler (if using centralized error middleware)
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        // Fallback Error
        res.status(500).json({ message: "Authentication error", error: error.message });
    }
};

export const AuthenticateRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extract & validate header
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            throw new AppError("Authorization header missing or malformed", 401, "AUTH_MIDDLEWARE");
        }
        const token = authHeader.split(" ")[1];
        if (!token) throw new AppError("Refresh token missing", 401, "AUTH_MIDDLEWARE");

        const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
        if (!JWT_REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET not configured");

        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
        req.user = decoded;

        next();
    } catch (error: any) {
        console.error(`[AUTH FAILURE]:`, error);

        // 4️⃣ Specific JWT error handling
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: "Token expired" });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // Custom AppError handler (if using centralized error middleware)
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        // Fallback Error
        res.status(500).json({ message: "Authentication error", error: error.message });
    }
};
