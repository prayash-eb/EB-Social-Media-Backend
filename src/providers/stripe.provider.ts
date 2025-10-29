import Stripe from "stripe";
import { AppError } from "../libs/customError.js";
import Transaction from "../models/transactions.model.js";
import { Message } from "../models/chat.model.js";
import stripe from "../libs/stripe.js";
import type { IPaymentProvider } from "../interfaces/payment-provider.interface.js";

export default class StripeProvider implements IPaymentProvider {
    public constructEvent = (body: string, signature: string) => {
        return stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    };
    public createCustomer = async (email: string): Promise<string> => {
        const customer = await stripe.customers.create({ email });
        return customer.id;
    };
    public createSubscription = async (
        customerId: string,
        userId: string,
        paymentMethodId: string,
        priceId: string
    ): Promise<{
        subscriptionId: string;
        clientSecret: string | null;
        subscriptionStatus: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        latestInvoiceId: string | null;
    }> => {
        // Attach the payment method to customer (if not already attached)
        await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });

        // Set as default payment method for invoices
        await stripe.customers.update(customerId, {
            invoice_settings: { default_payment_method: paymentMethodId },
        });

        // Create the subscription
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_settings: {
                payment_method_types: ["card"],
                save_default_payment_method: "on_subscription",
            },
            expand: ["latest_invoice.payment_intent"],
            metadata: {
                userId,
            },
        });

        // Safely extract clientSecret if payment_intent exists
        let clientSecret: string | null = null;
        let latestInvoiceId: string | null = null;

        if (subscription.latest_invoice) {
            const invoice =
                typeof subscription.latest_invoice === "string"
                    ? await stripe.invoices.retrieve(subscription.latest_invoice, {
                          expand: ["payment_intent"],
                      })
                    : subscription.latest_invoice;

            latestInvoiceId = invoice.id;

            // Check if invoice has payment_intent that requires action
            // @ts-expect-error - payment_intent exists when expanded
            const paymentIntent = invoice.payment_intent;
            if (paymentIntent && typeof paymentIntent === "object") {
                // Only return client_secret if confirmation is needed
                if (
                    paymentIntent.status === "requires_payment_method" ||
                    paymentIntent.status === "requires_confirmation"
                ) {
                    clientSecret = paymentIntent.client_secret;
                }
            }
        }

        // Safe date handling with fallbacks
        const firstItem = subscription.items.data[0];
        if (!firstItem) {
            throw new AppError("Subscription has no items", 400, "STRIPE_PROVIDER");
        }

        const currentPeriodStart = new Date(
            (firstItem.current_period_start || Date.now() / 1000) * 1000
        );
        const currentPeriodEnd = new Date(
            (firstItem.current_period_end || Date.now() / 1000) * 1000
        );

        return {
            subscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            clientSecret,
            currentPeriodStart,
            currentPeriodEnd,
            latestInvoiceId,
        };
    };

    public attachPaymentMethod = async (
        customerId: string,
        paymentMethodId: string
    ): Promise<void> => {
        try {
            // Check if payment method is already attached to avoid errors
            const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
            if (paymentMethod.customer !== customerId) {
                await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
            }
            await stripe.customers.update(customerId, {
                invoice_settings: { default_payment_method: paymentMethodId },
            });
        } catch (error: unknown) {
            const stripeError = error as { code?: string };
            if (stripeError.code === "resource_already_exists") {
                // Payment method already attached, just update customer
                await stripe.customers.update(customerId, {
                    invoice_settings: { default_payment_method: paymentMethodId },
                });
            } else {
                throw error;
            }
        }
    };

    public cancelSubscription = async (subscriptionId: string, immediately = true) => {
        if (immediately) {
            // Cancel immediately
            await stripe.subscriptions.cancel(subscriptionId);
        } else {
            // Cancel at period end
            await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
        }
    };

    public updateSubscription = async (
        subscriptionId: string,
        newPriceId: string
    ): Promise<{ subscriptionId: string; clientSecret: string | null }> => {
        // First, get the current subscription to get the current item ID
        const currentSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        const currentItemId = currentSubscription.items.data[0]?.id;

        if (!currentItemId) {
            throw new AppError("Subscription has no items", 400, "STRIPE_PROVIDER");
        }

        // Update subscription with proper item modification
        const updated = await stripe.subscriptions.update(subscriptionId, {
            items: [
                {
                    id: currentItemId,
                    price: newPriceId,
                },
            ],
            proration_behavior: "create_prorations", // Handle prorations properly
            expand: ["latest_invoice.payment_intent"],
        });

        let clientSecret: string | null = null;
        if (updated.latest_invoice && typeof updated.latest_invoice !== "string") {
            // @ts-expect-error - payment_intent exists when expanded
            const paymentIntent = updated.latest_invoice.payment_intent;
            if (paymentIntent && typeof paymentIntent === "object") {
                if (
                    paymentIntent.status === "requires_payment_method" ||
                    paymentIntent.status === "requires_confirmation"
                ) {
                    clientSecret = paymentIntent.client_secret;
                }
            }
        }

        return { subscriptionId: updated.id, clientSecret };
    };

    public createPaymentIntent = async (
        customerId: string,
        price: number,
        destinationAccountId?: string
    ): Promise<{ clientSecret: string; paymentIntentId: string }> => {
        const paymentIntentData: Stripe.PaymentIntentCreateParams = {
            customer: customerId,
            amount: Math.round(price * 100), // Convert to cents
            currency: "usd",
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: "never",
            },
            metadata: {
                customerId: customerId,
            },
        };

        // Only add transfer_data if destination account is provided and valid
        if (destinationAccountId) {
            paymentIntentData.transfer_data = { destination: destinationAccountId };
            paymentIntentData.metadata!.destinationAccountId = destinationAccountId;
        }

        const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

        return {
            clientSecret: paymentIntent.client_secret!,
            paymentIntentId: paymentIntent.id,
        };
    };
    public handleWebHook = async (signature: string, body: string): Promise<void> => {
        const event = Stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
        switch (event.type) {
            case "payment_intent.succeeded": {
                console.log("Payment Succeeded for paymentIntent Id:", event.data.object.id);
                const paymentIntentId = event.data.object.id;
                const tx = await Transaction.findOne({ stripePaymentIntentId: paymentIntentId });
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
}
