import type SubscriptionService from "../services/subscription.service.js";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../libs/customError.js";
import mongoose from "mongoose";
export default class SubscriptionController {
    constructor(private subscriptionService: SubscriptionService) { }
    private validateUser(req: Request): mongoose.Types.ObjectId {
        if (!req.user?.id) {
            throw new AppError("User not authenticated", 401, "SUBSCRIPTION_CONTROLLER");
        }
        return req.user.id;
    }

    public createUserCustomer = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = this.validateUser(req);
            const { customerId, clientSecret } = await this.subscriptionService.createCustomerAndSetupIntent(userId);
            res.status(200).json({ message: "Customer Created Successfully", customerId, clientSecret });
        } catch (error) {
            next(error);
        }
    };

    public createUserSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = this.validateUser(req);
            const { paymentMethodId } = req.body;
            const subscription = await this.subscriptionService.createSubscription(
                userId,
                paymentMethodId
            );
            res.status(200).json({ message: "Subscription Created Successfully", subscription });
        } catch (error) {
            next(error);
        }
    };

    public attachPaymentMethod = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = this.validateUser(req);
            const { paymentMethodId } = req.body;
            const subscription = await this.subscriptionService.attachPaymentMethod(
                userId,
                paymentMethodId
            );
            res.status(200).json({ message: "Payment Method Updated Successfully", subscription });
        } catch (error) {
            next(error);
        }
    };

    public updateUserSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = this.validateUser(req);
            const { newPriceId } = req.body;
            const subscription = await this.subscriptionService.updateSubscription(
                userId,
                newPriceId
            );
            res.status(200).json({ message: "Subscription Updated Successfully", subscription });
        } catch (error) {
            next(error);
        }
    };

    public cancelUserSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = this.validateUser(req);
            const { immediately } = req.body;
            await this.subscriptionService.cancelSubscription(userId, Boolean(immediately));
            res.status(200).json({
                message: immediately
                    ? "Subscription cancelled immediately"
                    : "Subscription will cancel at period end",
            });
        } catch (error) {
            next(error);
        }
    };

    public createPaymentIntent = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const receiverId = this.validateUser(req);
            const { senderId, messageId } = req.body;
            const clientSecret = await this.subscriptionService.createPaymentIntent(
                senderId,
                receiverId,
                messageId
            );
            res.status(200).json({ clientSecret });
        } catch (error) {
            next(error);
        }
    };

    public handleWebHookEvents = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const signature = req.headers["stripe-signature"] as string;

            await this.subscriptionService.handleWebHook(req.body, signature);
            res.status(200).json({ received: true });
        } catch (error) {
            next(error);
        }
    };

    public getTransactionHistory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = this.validateUser(req);
            const transactions = await this.subscriptionService.getTransactions(userId);
            res.status(200).json({ message: "Transactions Fetched Successfully", transactions });
        } catch (error) {
            next(error);
        }
    };
}
