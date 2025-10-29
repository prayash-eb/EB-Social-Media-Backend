import StripeProvider from "../providers/stripe.provider.js";
import Transaction from "../models/transactions.model.js";
import { Message } from "../models/chat.model.js";
import { AppError } from "../libs/customError.js";
import Subscription, { type ISubscription } from "../models/subscription.model.js";
import User from "../models/user.model.js";
import type Stripe from "stripe";

export class StripeWebhookService {
    constructor(private stripeProvider: StripeProvider) {}

    public handleEvent = async (body: string, signature: string) => {
        const event = await this.stripeProvider.constructEvent(body, signature);

        switch (event.type) {
            // ONE-OFF PAYMENTS
            case "payment_intent.succeeded": {
                console.log("WEBHOOK TRIGGERED", event.type);

                const paymentIntent = event.data.object as Stripe.PaymentIntent;

                const tx = await Transaction.findOne({ stripePaymentIntentId: paymentIntent.id });
                if (tx) {
                    tx.status = "succeeded";
                    await tx.save();

                    if (tx.messageId) {
                        await Message.findByIdAndUpdate(tx.messageId, { isLocked: false });
                    }
                }
                break;
            }

            case "payment_intent.payment_failed": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const tx = await Transaction.findOne({ stripePaymentIntentId: paymentIntent.id });
                if (tx) {
                    tx.status = "failed";
                    await tx.save();
                }
                break;
            }

            // SUBSCRIPTION CREATED / UPDATED
            case "customer.subscription.created":
            case "customer.subscription.updated": {
                console.log("WEBHOOK TRIGGERED", event.type);

                const sub = event.data.object as Stripe.Subscription;

                const existing = await Subscription.findOne({ stripeSubscriptionId: sub.id });

                if (existing) {
                    existing.status = sub.status as ISubscription["status"];
                    existing.currentPeriodStart = new Date(
                        sub.items.data[0]?.current_period_start! * 1000
                    );
                    existing.currentPeriodEnd = new Date(
                        sub.items.data[0]?.current_period_end! * 1000
                    );
                    existing.cancelAtPeriodEnd = sub.cancel_at_period_end;
                    existing.latestInvoiceId = sub.latest_invoice as string;
                    await existing.save();
                } else {
                    await Subscription.create({
                        userId: sub.metadata.userId, // make sure to set metadata.userId when creating subscription
                        stripeCustomerId: sub.customer as string,
                        stripeSubscriptionId: sub.id,
                        priceId: sub.items.data[0]!.price.id,
                        currentPeriodStart: new Date(
                            sub.items.data[0]?.current_period_start! * 1000
                        ),
                        currentPeriodEnd: new Date(sub.items.data[0]?.current_period_end! * 1000),
                        cancelAtPeriodEnd: sub.cancel_at_period_end,
                        status: sub.status,
                        latestInvoiceId: sub.latest_invoice as string,
                    });
                }
                break;
            }

            // SUBSCRIPTION PAYMENT (FIRST OR RENEWAL)
            case "invoice.payment_succeeded": {
                console.log("WEBHOOK TRIGGERED", event.type);

                const invoice = event.data.object as Stripe.Invoice;

                const user = await User.findOne({ stripeCustomerId: invoice.customer });
                if (!user) throw new AppError("User not found", 404, "STRIPE_WEBHOOK");

                const tx = await Transaction.create({
                    type: "subscription",
                    senderId: user._id,
                    stripeInvoiceId: invoice.id,
                    stripeSubscriptionId: invoice.parent?.subscription_details?.subscription,
                    amount: invoice.amount_paid / 100,
                    currency: invoice.currency,
                    status: "succeeded",
                });

                // Update subscription period
                const periodStart = invoice.lines.data[0]?.period?.start;
                const periodEnd = invoice.lines.data[0]?.period?.end;
                if (periodStart && periodEnd) {
                    await Subscription.findOneAndUpdate(
                        {
                            stripeSubscriptionId:
                                invoice.parent?.subscription_details?.subscription,
                        },
                        {
                            status: "active",
                            currentPeriodStart: new Date(periodStart * 1000),
                            currentPeriodEnd: new Date(periodEnd * 1000),
                            latestInvoiceId: invoice.id,
                        }
                    );
                }

                break;
            }

            // SUBSCRIPTION CANCELED
            case "customer.subscription.deleted": {
                console.log("WEBHOOK TRIGGERED", event.type);

                const subscription = event.data.object as Stripe.Subscription;
                await Subscription.findOneAndUpdate(
                    { stripeSubscriptionId: subscription.id },
                    { status: "canceled", cancelAtPeriodEnd: true }
                );
                break;
            }

            default:
                console.log("Unhandled event", event.type);
        }
    };
}
