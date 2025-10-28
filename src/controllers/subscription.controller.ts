import type SubscriptionService from "../services/subscription.service.js";
import type { Request, Response, NextFunction } from "express";
export default class SubscriptionController {
    constructor(private subscriptionService: SubscriptionService) {}
    public createUserSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id!;
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
    public updateUserSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id!;
            const { paymentMethodId } = req.body;
            const subscription = await this.subscriptionService.updateSubscription(
                userId,
                paymentMethodId
            );
            res.status(200).json({ message: "Subscription Updated Successfully", subscription });
        } catch (error) {
            next(error);
        }
    };
    public cancelUserSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id!;
            const { paymentMethodId } = req.body;
            const subscription = await this.subscriptionService.cancelSubscription(
                userId,
                paymentMethodId
            );
            res.status(200).json({ message: "Subscription Updated Successfully", subscription });
        } catch (error) {
            next(error);
        }
    };
}
