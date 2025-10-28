import type StripeService from "../services/stripe.service.js";
import type { NextFunction, Request, Response } from "express";
import Stripe from "stripe";

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

    public handlePaymentWebhook = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const signature = req.headers["stripe-signature"] as string;
            const event = Stripe.webhooks.constructEvent(
                req.body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET!
            );
            await this.stripeService.handleWebhook(event);
            res.status(200).json({ message: "Webhook Triggered Successfully" });
        } catch (error) {
            next(error);
        }
    };
}
