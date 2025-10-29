import mongoose, { Document, Schema, model } from "mongoose";

export interface ISubscription extends Document {
    userId: mongoose.Types.ObjectId;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    priceId: string; // Stripe Price ID
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    status:
        | "active"
        | "incomplete"
        | "incomplete_expired"
        | "trialing"
        | "past_due"
        | "canceled"
        | "unpaid";
    latestInvoiceId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        stripeCustomerId: { type: String, required: true },
        stripeSubscriptionId: { type: String, required: true },
        priceId: { type: String, required: true },
        currentPeriodStart: { type: Date },
        currentPeriodEnd: { type: Date },
        cancelAtPeriodEnd: { type: Boolean, default: false },
        status: {
            type: String,
            enum: [
                "active",
                "incomplete",
                "incomplete_expired",
                "trialing",
                "past_due",
                "canceled",
                "unpaid",
            ],
            required: true,
        },
        latestInvoiceId: String,
    },
    { timestamps: true }
);

const Subscription = model<ISubscription>("Subscription", SubscriptionSchema);
export default Subscription;
