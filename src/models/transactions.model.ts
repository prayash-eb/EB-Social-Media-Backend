import mongoose, { Document, Schema, model } from "mongoose";

export interface ITransaction extends Document {
    messageId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    stripePaymentIntentId: string;
    amount: number;
    status: "pending" | "succeeded" | "failed";
    createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
    messageId: mongoose.Schema.Types.ObjectId,
    senderId: mongoose.Schema.Types.ObjectId,
    receiverId: mongoose.Schema.Types.ObjectId,
    stripePaymentIntentId: String,
    amount: Number,
    status: { type: String, enum: ["pending", "succeeded", "failed"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
});

const Transaction = model("Transaction", TransactionSchema);
export default Transaction;
