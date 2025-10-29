import mongoose from "mongoose";
import User from "../models/user.model.js";
import { AppError } from "../libs/customError.js";
import type { IPaymentProvider } from "../interfaces/payment-provider.interface.js";
import Transaction from "../models/transactions.model.js";
import { Message } from "../models/chat.model.js";
import Subscription from "../models/subscription.model.js";
import { StripeWebhookService } from "../webhooks/stripe.webhook.js";
import StripeProvider from "../providers/stripe.provider.js";

export default class SubscriptionService {
    constructor(private paymentProvider: IPaymentProvider) {}
    public createSubscription = async (
        userId: mongoose.Types.ObjectId,
        paymentMethodId: string
    ) => {
        const user = await User.findById(userId);
        if (!user) throw new AppError("User not found", 404, "SUBSCRIPTION_SERVICE");

        // Check if user already has an active subscription
        const existingSubscription = await Subscription.findOne({
            userId,
            status: { $in: ["active", "trialing", "incomplete"] },
        });

        if (existingSubscription) {
            throw new AppError(
                "User already has an active subscription",
                409,
                "SUBSCRIPTION_SERVICE"
            );
        }

        let customerId = user.stripeCustomerId;
        // Ensure customer exists
        if (!customerId) {
            customerId = await this.paymentProvider.createCustomer(user.email);
            user.stripeCustomerId = customerId;
            await user.save();
        }

        // Attach payment method & update customer
        await this.paymentProvider.attachPaymentMethod(customerId, paymentMethodId);

        const priceId = process.env.STRIPE_PRICE_ID;
        if (!priceId) {
            throw new AppError("Stripe price ID not configured", 500, "SUBSCRIPTION_SERVICE");
        }

        const {
            subscriptionId,
            clientSecret,
            subscriptionStatus,
            currentPeriodEnd,
            currentPeriodStart,
            latestInvoiceId,
        } = await this.paymentProvider.createSubscription(
            customerId,
            userId.toString(),
            paymentMethodId,
            priceId
        );

        await Subscription.create({
            userId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            priceId,
            currentPeriodStart,
            currentPeriodEnd,
            latestInvoiceId,
            cancelAtPeriodEnd: false,
            status: subscriptionStatus,
        });

        return {
            clientSecret,
            subscriptionId,
        };
    };

    public attachPaymentMethod = async (
        userId: mongoose.Types.ObjectId,
        paymentMethodId: string
    ) => {
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError("User not found", 404, "UBSCRIPTION_SERVICE");
        }
        if (!user.stripeCustomerId)
            throw new AppError("Please create a subscription first", 400, "SUBSCRIPTION_SERVICE");
        await this.paymentProvider.attachPaymentMethod(user.stripeCustomerId!, paymentMethodId);
    };

    public updateSubscription = async (userId: mongoose.Types.ObjectId, newPriceId: string) => {
        const subscription = await Subscription.findOne({ userId, status: "active" });
        if (!subscription) {
            throw new AppError("Active subscription not found", 404, "SUBSCRIPTION_SERVICE");
        }
        // Update the subscription in Stripe
        const { subscriptionId, clientSecret } = await this.paymentProvider.updateSubscription(
            subscription.stripeSubscriptionId,
            newPriceId
        );

        // Update the Subscription document
        subscription.priceId = newPriceId;
        // Note: Don't change status here - let webhooks handle status changes
        // Only set to incomplete if clientSecret is returned (requires payment confirmation)
        if (clientSecret) {
            subscription.status = "incomplete";
        }
        await subscription.save();

        return { subscriptionId, clientSecret };
    };

    public cancelSubscription = async (userId: mongoose.Types.ObjectId, immediately = true) => {
        const subscription = await Subscription.findOne({ userId, status: "active" });
        if (!subscription)
            throw new AppError("Active subscription not found", 404, "SUBSCRIPTION_SERVICE");

        // Cancel the subscription in Stripe
        await this.paymentProvider.cancelSubscription(
            subscription.stripeSubscriptionId,
            immediately
        );

        // Only update cancelAtPeriodEnd flag locally
        // Let webhooks handle status updates to maintain consistency
        subscription.cancelAtPeriodEnd = !immediately;
        if (immediately) {
            // For immediate cancellation, we can update status as it's instant
            subscription.status = "canceled";
        }
        await subscription.save();
    };

    public createPaymentIntent = async (
        senderId: mongoose.Types.ObjectId,
        receiverId: mongoose.Types.ObjectId,
        messageId: mongoose.Types.ObjectId
    ) => {
        const messageSender = await User.findById(senderId);
        const messageReceiver = await User.findById(receiverId);

        if (!messageSender || !messageReceiver) {
            throw new AppError("Sender or Receiver does not exist", 404, "SUBSCRIPTION_SERVICE");
        }

        const message = await Message.findOne({
            _id: messageId,
            isLocked: true,
        });

        if (!message) {
            throw new AppError("Message not found", 404, "SUBSCRIPTION_SERVICE");
        }

        const transactionPending = await Transaction.findOne({
            messageId: messageId,
            status: "pending",
        });
        if (transactionPending) {
            throw new AppError(
                "Transaction Pending. Wait for some time and try again if transaction fails.",
                409,
                "SUBSCRIPTION_SERVICE"
            );
        }

        // Use existing customer or create new one
        let customerId = messageReceiver.stripeCustomerId;
        if (!customerId) {
            customerId = await this.paymentProvider.createCustomer(messageReceiver.email);
            messageReceiver.stripeCustomerId = customerId;
            await messageReceiver.save();
        }

        // Only pass destination account if sender has one configured
        const destinationAccountId = messageSender.stripeAccountId || undefined;
        const { clientSecret, paymentIntentId } = await this.paymentProvider.createPaymentIntent(
            customerId,
            message.price!,
            destinationAccountId
        );

        // Minimal transaction record
        await Transaction.create({
            type: "one_time",
            messageId: message._id,
            senderId: messageSender._id,
            receiverId: messageReceiver._id,
            stripePaymentIntentId: paymentIntentId,
            amount: message.price,
        });

        return clientSecret;
    };

    public handleWebHook = async (body: string, signature: string) => {
        const stripeWebhookService = new StripeWebhookService(new StripeProvider());
        await stripeWebhookService.handleEvent(body, signature);
    };

    public getTransactions = async (userId: mongoose.Types.ObjectId) => {
        const user = await User.findById(userId);
        if (!user) throw new AppError("User not found", 404, "SUBSCRIPTION_SERVICE");

        // Get transactions where user is sender or receiver
        const transactions = await Transaction.find({
            $or: [{ senderId: userId }, { receiverId: userId }],
        })
            .populate("senderId", "name email")
            .populate("receiverId", "name email")
            .sort({ createdAt: -1 });

        return transactions;
    };
}
