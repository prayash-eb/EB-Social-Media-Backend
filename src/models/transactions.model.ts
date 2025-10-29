import mongoose, { Document, Schema, model } from "mongoose";

export interface ITransaction extends Document {
    type: "one_time" | "subscription";
    messageId?: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    receiverId?: mongoose.Types.ObjectId;
    stripePaymentIntentId?: string; // used for one-time payments
    stripeSubscriptionId?: string; // used for subscription
    stripeInvoiceId?: string; // used for subscription recurring charges
    amount: number;
    currency: string;
    status: "pending" | "succeeded" | "failed";
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        type: { type: String, enum: ["one_time", "subscription"], required: true },
        messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        stripePaymentIntentId: String,
        stripeSubscriptionId: String,
        stripeInvoiceId: String,
        amount: { type: Number, required: true },
        currency: { type: String, default: "usd" },
        status: { type: String, enum: ["pending", "succeeded", "failed"], default: "pending" },
        description: String,
    },
    { timestamps: true }
);

const Transaction = model<ITransaction>("Transaction", TransactionSchema);
export default Transaction;
