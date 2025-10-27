import type StripeService from "../services/stripe.service.js";
import type { NextFunction, Request, Response } from "express";

export default class PaymentController {
    constructor(private stripeService: StripeService) {}

    public createPaymentIntent = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const receiverId = req.user?.id!;
            const { senderId, messageId } = req.body;
            const clientSecret = await this.stripeService.createPaymentMessageIntent(
                senderId,
                receiverId,
                messageId
            );
            res.status(200).json({ clientSecret });
        } catch (error) {
            next(error);
        }
    };
    public getPaymentHistory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const transactions = await this.stripeService.getTransactions(req.user?.id!);
            res.status(200).json(transactions);
        } catch (error) {
            next(error);
        }
    };
}
