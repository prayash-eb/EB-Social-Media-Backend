import mongoose, { Document, model, Schema } from "mongoose";

type NotificationType = "LIKE" | "COMMENT" | "FOLLOW" | "SYSTEM"

export interface INotification {
    userId: mongoose.Types.ObjectId;
    content: string;
    isRead: boolean;
    type: NotificationType
    createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Notification = model<INotification>("Notification", notificationSchema)
export default Notification