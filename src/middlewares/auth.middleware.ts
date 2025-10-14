import type { Request, NextFunction, Response } from "express"
import jwt from "jsonwebtoken"
import type mongoose from "mongoose"
import User from "../models/user.model.js"
import { AppError } from "../libs/customError.js"

export interface JWTPayload extends jwt.JwtPayload {
    id: mongoose.Types.ObjectId,
    email: string;
    iat?: number;
    exp?: number;
}

declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload
            token?: string
        }
    }
}

export const Authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Extract & validate header
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            throw new AppError("Authorization header missing or malformed", 401, "AUTH_MIDDLEWARE");
        }

        const token = authHeader.split(" ")[1];
        if (!token) throw new AppError("Access token missing", 401, "AUTH_MIDDLEWARE");

        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) throw new Error("JWT_SECRET not configured");

        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        req.user = decoded;
        req.token = token

        // Validate against allowed sessions
        const user = await User.findById(decoded.id).select("sessions");
        if (!user) throw new AppError("User not found", 404, "AUTH_MIDDLEWARE");

        // If enforcing session validation:
        if (!user.sessions.some(s => s.token === token)) {
            throw new AppError("Session expired or invalid", 401, "AUTH_MIDDLEWARE");
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