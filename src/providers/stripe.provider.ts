import type mongoose from "mongoose";
import Stripe from "stripe";
import User from "../models/user.model.js";
import { AppError } from "../libs/customError.js";
import Transaction, { type ITransaction } from "../models/transactions.model.js";
import { Message } from "../models/chat.model.js";
import stripe from "../libs/stripe.js";
import type { IPaymentProvider } from "../interfaces/payment-provider.interface.js";

export default class StripeProvider implements IPaymentProvider {

    public createCustomer = async (email: string): Promise<string> => {
        const customer = await stripe.customers.create({ email });
        return customer.id;
    };
    public createSubscription = async (customerId: string, priceId: string): Promise<{ subscriptionId: string; clientSecret: string; subscriptionStatus: string }> => {
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: "default_incomplete",
            expand: ["latest_invoice.payment_intent"],
        });

        let clientSecret: string = "";
        if (subscription.latest_invoice && typeof subscription.latest_invoice !== "string") {
            const invoice = subscription.latest_invoice as Stripe.Invoice & {
                payment_intent: Stripe.PaymentIntent;
            };
            clientSecret = invoice.payment_intent.client_secret as string;
        }

        return {
            subscriptionId: subscription.id, subscriptionStatus: subscription.status, clientSecret
        };
    }

    public attachPaymentMethod = async (customerId: string, paymentMethodId: string): Promise<void> => {
        await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
        await stripe.customers.update(customerId, {
            invoice_settings: { default_payment_method: paymentMethodId },
        });
    }

    public updateDefaultPaymentMethod = async (customerId: string, paymentMethodId: string): Promise<void> => {
        await stripe.customers.update(customerId, {
            invoice_settings: { default_payment_method: paymentMethodId },
        });
    }

    public cancelSubscription = async (subscriptionId: string, immediately = true) => {
        if (immediately) {
            await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: false });
        } else {
            await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
        }
    }

    public updateSubscription = async (subscriptionId: string, newPriceId: string): Promise<{ subscriptionId: string; clientSecret: string; }> => {
        const updated = await stripe.subscriptions.update(subscriptionId, {
            items: [{ price: newPriceId }],
            expand: ["latest_invoice.payment_intent"],
        });

        let clientSecret: string = "";
        if (updated.latest_invoice && typeof updated.latest_invoice !== "string") {
            const invoice = updated.latest_invoice as Stripe.Invoice & {
                payment_intent: Stripe.PaymentIntent;
            };
            clientSecret = invoice.payment_intent.client_secret as string;
        }

        return { subscriptionId: updated.id, clientSecret };
    }

    public createPaymentIntent = async (customerId: string, price: number, messageSenderId: string): Promise<{ clientSecret: string, paymentIntentId: string }> => {
        const paymentIntent = await stripe.paymentIntents.create({
            customer: customerId,
            amount: Math.round(price * 10),
            currency: "usd",
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: "never",
            },
            transfer_data: { destination: messageSenderId },
            metadata: {
                senderId: messageSenderId,
                receiverId: customerId,
            },
        });

        return {
            clientSecret: paymentIntent.client_secret!,
            paymentIntentId: paymentIntent.id
        }
    }
    public handleWebHook = async (event: Stripe.Event): Promise<void> => {
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
        userId: mongoose.Types.ObjectId
    ): Promise<ITransaction[]> => {
        return await Transaction.find({ userId }).sort({ createdAt: -1 });
    };
}
