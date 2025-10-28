import type mongoose from "mongoose";
import User from "../models/user.model.js";
import { AppError } from "../libs/customError.js";
import type { IPaymentProvider } from "../interfaces/payment-provider.interface.js";
import Transaction from "../models/transactions.model.js";
import { Message } from "../models/chat.model.js";

export default class SubscriptionService {
    constructor(private paymentProvider: IPaymentProvider) { }
    public createSubscription = async (
        userId: mongoose.Types.ObjectId,
        paymentMethodId: string
    ) => {
        const user = await User.findById(userId);
        if (!user) throw new AppError("User not found", 404, "SUBSCRIPION_SERVICE");

        let customerId: string;
        // Ensure customer exists
        if (!user.stripeCustomerId) {
            customerId = await this.paymentProvider.createCustomer(user.email)
            user.stripeCustomerId = customerId;
            await user.save();
        }
        // Attach payment method & update customer
        await this.paymentProvider.attachPaymentMethod(user.stripeCustomerId, paymentMethodId);
        await this.paymentProvider.updateDefaultPaymentMethod(user.stripeCustomerId, paymentMethodId)

        const { subscriptionId, clientSecret, subscriptionStatus } = await this.paymentProvider.createSubscription(user.stripeCustomerId, process.env.STRIPE_PRICE_ID!)

        // Save subscription data to DB
        user.subscriptionId = subscriptionId;
        user.subscriptionStatus = subscriptionStatus;
        await user.save();

        return {
            clientSecret,
            subscriptionId,
        };
    };

    public updateSubscription = async (
        userId: mongoose.Types.ObjectId,
        newPriceId: string
    ) => {
        const user = await User.findById(userId);
        if (!user || !user.subscriptionId) throw new AppError("Subscription not found", 404, "SUBSCRIPTION_SERVICE");

        const { subscriptionId, clientSecret } = await this.paymentProvider.updateSubscription(
            user.subscriptionId,
            newPriceId
        );

        user.subscriptionId = subscriptionId;
        user.subscriptionStatus = "incomplete";
        await user.save();

        return { subscriptionId, clientSecret };
    };

    public cancelSubscription = async (
        userId: mongoose.Types.ObjectId,
        immediately = true
    ) => {
        const user = await User.findById(userId);
        if (!user || !user.subscriptionId) throw new AppError("Subscription not found", 404, "SUBSCRIPTION_SERVICE");

        await this.paymentProvider.cancelSubscription(user.subscriptionId, immediately);

        user.subscriptionStatus = "canceled";
        await user.save();
    };

    public createPaymentIntent = async (
        senderId: mongoose.Types.ObjectId,
        receiverId: mongoose.Types.ObjectId,
        messageId: mongoose.Types.ObjectId
    ) => {
        const messageSender = await User.findById(senderId);
        const messageReceiver = await User.findById(receiverId);

        if (!messageSender || !messageReceiver) {
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

        const customerId = await this.paymentProvider.createCustomer(messageReceiver.email);
        const { clientSecret, paymentIntentId } = await this.paymentProvider.createPaymentIntent(customerId, message.price!, messageSender.stripeAccountId!)

        // Minimal transaction record
        await Transaction.create({
            messageId: message._id,
            senderId: messageSender._id,
            receiverId: messageReceiver._id,
            stripePaymentIntentId: paymentIntentId,
            amount: message.price,
        });

        return clientSecret
    };

}
