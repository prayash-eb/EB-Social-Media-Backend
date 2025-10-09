import type { Request, NextFunction, Response } from "express"
import jwt from "jsonwebtoken"
import type mongoose from "mongoose"
import User from "../models/user.model.js"
import { AppError } from "../libs/customError.js"

export interface JWTPayload extends jwt.JwtPayload {
    id: mongoose.Types.ObjectId,
    email: string
}

declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload
        }
    }
}

export const Authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized User" })
        }
        const accessToken = authHeader!.split(" ")[1];
        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized User" })
        }
        const decoded = jwt.verify(accessToken!, process.env.JWT_SECRET!)
        req.user = decoded as JWTPayload
        next()
    } catch (error) {
        console.log(`[AUTHENTICATION FAILURE]: ${error}`);
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ message: "Invalid JWT", error })
        } else {
            next(error)
        }
    }
}