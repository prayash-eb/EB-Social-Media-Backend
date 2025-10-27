import type mongoose from "mongoose";
import Stripe from "stripe";
import User from "../models/user.model.js";
import { AppError } from "../libs/customError.js";
import Transaction, { type ITransaction } from "../models/transactions.model.js";
import { Message } from "../models/chat.model.js";

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
            _id: messageId, isLocked: true
        });

        if (!message) {
            throw new AppError("Message not found", 404, "STRIPE_SERVICE");
        }

        const transactionPending = await Transaction.findOne({
            messageId: messageId,
            status: "pending"
        })
        if (transactionPending) {
            throw new AppError("Transaction Pending. Wait for some time and try again if transaction fails.", 409, "STRIPE_SERVICE")
        }

        const customerId = await this.ensureCustomer(receiverId);

        const paymentIntent = await this.stripe.paymentIntents.create({
            customer: customerId,
            amount: Math.round(message?.price! * 100),
            currency: "usd",
            automatic_payment_methods: {
                enabled: true,
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
    public handleWebhook = async (event: any) => {
        if (event.type === "payment_intent.succeeded") {
            const pi = event.data.object;
            const tx = await Transaction.findOne({ stripePaymentIntentId: pi.id });
            if (tx) tx.status = "succeeded";
            await tx?.save();
            await Message.findByIdAndUpdate(
                { _id: tx?.messageId },
                {
                    $set: {
                        isLocked: false,
                    },
                }
            );
        }
    };

    public getTransactions = async (
        receiverId: mongoose.Types.ObjectId
    ): Promise<ITransaction[]> => {
        return await Transaction.find({ receiverId }).sort({ createdAt: -1 });
    };
}
