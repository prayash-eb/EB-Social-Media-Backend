import type { Request, Response, NextFunction } from "express";
import User from "../models/user.model.js";
import { AppError } from "../libs/customError.js";
import stripe from "../libs/stripe.js";
import Subscription from "../models/subscription.model.js";

export const requireActiveSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const subscription = await Subscription.findOne({
            userId: req.user?.id,
        });

        if (!subscription) {
            throw new AppError("Subscription Not Found", 403, "SUBSCRIPTION_MIDDLEWARE");
        }

        const validateSubscription = await stripe.subscriptions.retrieve(
            subscription.stripeSubscriptionId
        );
        if (!["active", "trialing"].includes(validateSubscription.status)) {
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
