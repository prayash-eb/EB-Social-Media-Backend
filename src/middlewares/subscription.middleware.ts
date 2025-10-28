import type { Request, Response, NextFunction } from "express";
import User from "../models/user.model.js";
import { AppError } from "../libs/customError.js";
import stripe from "../libs/stripe.js";

export const requireActiveSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await User.findById(req.user?.id);
        if (!user) {
            throw new AppError("User not found", 404, "SUBSCRIPTION_MIDDLEWARE");
        }
        if (!user.subscriptionId) {
            throw new AppError(
                "Please subscribe our app before using this feature",
                403,
                "SUBSCRIPTION_MIDDLEWARE"
            );
        }
        const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
        if (!["active", "trialing"].includes(subscription.status)) {
            throw new AppError(
                "Subscription is inactive or expired",
                403,
                "SUBSCRIPTION_MIDDLEWARE"
            );
        }
        next();
    } catch (error) {
        next(error);
    }
};
