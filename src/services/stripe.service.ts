import type mongoose from "mongoose";
import Stripe from "stripe";
import User from "../models/user.model.js";
import { AppError } from "../libs/customError.js";
import Transaction, { type ITransaction } from "../models/transactions.model.js";
import { Message } from "../models/chat.model.js";
import { object } from "zod";

export default class StripeService {
    private stripe: Stripe;
    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: "2025-09-30.clover",
        });
    }

    public ensureCustomer = async (userId: mongoose.Types.ObjectId) => {
        const user = await User.findById(userId);
        if (!user) throw new AppError("User not found", 404, "STRIPE_SERVICE");
        if (user?.stripeCustomerId) return user.stripeCustomerId;

        const customer = await this.stripe.customers.create({
            email: user.email,
        });
        user.stripeCustomerId = customer.id;
        await user.save();
        return customer.id;
    };

    public createPaymentMessageIntent = async (
        senderId: mongoose.Types.ObjectId,
        receiverId: mongoose.Types.ObjectId,
        messageId: mongoose.Types.ObjectId
    ) => {
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            throw new AppError("Sender or Receiver doesnot exist", 404, "STRIPE_SERVICE");
        }
        const message = await Message.findOne({
            _id: messageId,
            isLocked: true,
        });

        if (!message) {
            throw new AppError("Message not found", 404, "STRIPE_SERVICE");
        }

        const transactionPending = await Transaction.findOne({
            messageId: messageId,
            status: "pending",
        });
        if (transactionPending) {
            throw new AppError(
                "Transaction Pending. Wait for some time and try again if transaction fails.",
                409,
                "STRIPE_SERVICE"
            );
        }

        const customerId = await this.ensureCustomer(receiverId);

        const paymentIntent = await this.stripe.paymentIntents.create({
            customer: customerId,
            amount: Math.round(message?.price! * 10),
            currency: "usd",
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: "never",
            },
            transfer_data: { destination: sender.stripeAccountId! },
            metadata: {
                messageId: messageId.toString(),
                senderId: senderId.toString(),
                receiverId: receiverId.toString(),
            },
        });

        // Minimal transaction record
        await Transaction.create({
            messageId: message._id,
            senderId: sender._id,
            receiverId: receiver._id,
            stripePaymentIntentId: paymentIntent.id,
            amount: message.price,
        });

        return paymentIntent.client_secret;
    };
    public handleWebhook = async (event: Stripe.Event) => {
        switch (event.type) {
            case "payment_intent.succeeded": {
                console.log("Payment Succeeded for paymentIntent Id:", event.data.object.id);
                const pi = event.data.object;
                const tx = await Transaction.findOne({ stripePaymentIntentId: pi.id });
                if (!tx) {
                    throw new AppError("Transaction not found", 404, "STRIPE_WEBHOOK");
                }
                tx.status = "succeeded";
                await tx?.save();
                await Message.findByIdAndUpdate(tx.messageId, { $set: { isLocked: false } });
                break;
            }
            case "payment_intent.payment_failed": {
                const pi = event.data.object;
                console.log("Payment failed reason:", pi.last_payment_error?.message);
                const tx = await Transaction.findOne({ stripePaymentIntentId: pi.id });
                if (!tx) {
                    throw new AppError("Transaction not found", 404, "STRIPE_WEBHOOK");
                }
                tx.status = "failed";
                await tx?.save();
                break;
            }

            case "payment_intent.created": {
                console.log("Payment Intent Created with paymentIntentId:", event.data.object.id);
                break;
            }
            default: {
                console.log("Unhandled event", event.type);
            }
        }
    };

    public getTransactions = async (
        receiverId: mongoose.Types.ObjectId
    ): Promise<ITransaction[]> => {
        return await Transaction.find({ receiverId }).sort({ createdAt: -1 });
    };
}
