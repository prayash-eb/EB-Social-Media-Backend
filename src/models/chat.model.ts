import mongoose, { Document, model, Schema, Types } from "mongoose";

export interface IMessage extends Document {
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    message: string;
    conversationId: Types.ObjectId;
    isRead: boolean;
    deletedFor: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IConversation extends Document {
    participants: Types.ObjectId[];
    deletedFor: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiver: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        deletedFor: [
            {
                type: Schema.Types.ObjectId,
                default: [],
            },
        ],
    },
    {
        timestamps: true,
    }
);

// compound index for increasing query performance when fetching conversation
messageSchema.index({ conversationId: 1, createdAt: 1 });
// compound index for fetching unread messages efficiently
messageSchema.index({ receiver: 1, isRead: 1 });

const conversationSchema = new Schema<IConversation>(
    {
        participants: {
            type: [{ type: Schema.Types.ObjectId, ref: "User" }],
            validate: [(val: any) => val.length === 2, "Must have 2 participants"],
            required: true,
        },
        deletedFor: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    },
    { timestamps: true }
);

// making sure the participants array is not duplicated [UserA, UserB] === [UserB, UserA] for conversation participants !
conversationSchema.pre("save", function (next) {
    this.participants.sort();
    next();
});

export const Message = model<IMessage>("Message", messageSchema);
export const Conversation = model<IConversation>("Conversation", conversationSchema);
