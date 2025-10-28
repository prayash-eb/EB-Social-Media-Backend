import type mongoose from "mongoose";
import type { ITransaction } from "../models/transactions.model.js";
import type Stripe from "stripe";

export interface IPaymentProvider {
    createCustomer(email: string): Promise<string>;
    attachPaymentMethod(customerId: string, paymentMethodId: string): Promise<void>;
    updateDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<void>;
    updateSubscription(subscriptionId: string, newPriceId: string): Promise<{ subscriptionId: string; clientSecret: string }>;
    createSubscription(
        customerId: string,
        priceId: string
    ): Promise<{ subscriptionId: string; clientSecret: string | null, subscriptionStatus: string }>;
    cancelSubscription(subscriptionId: string, immediately?: boolean): Promise<void>;
    createPaymentIntent(
        customerId: string,
        price: number,
        messageSenderId: string
    ): Promise<{ clientSecret: string, paymentIntentId: string }>;
    handleWebHook(event: Stripe.Event): Promise<void>;
    getTransactions(userId: mongoose.Types.ObjectId): Promise<ITransaction[] | null>
}
