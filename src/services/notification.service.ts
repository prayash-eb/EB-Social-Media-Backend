import User from "../models/user.model.js"
import Notification, { type INotification } from "../models/notification.model.js"
import type mongoose from "mongoose"

export default class NotificationService {

    public getNotifications = async (userId: mongoose.Types.ObjectId, page: number = 1, limit: number = 20) => {
        const skip = (page - 1) * limit;

        const total = await Notification.countDocuments({ userId });

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()

        const totalPages = Math.ceil(total / limit);

        return {
            notifications,
            total,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        };
    }

    public sendNotificationToAllUsers = async (message: string) => {
        const users = await User.find({}, { _id: 1 })
        const notifications = users.map((user) => ({
            userId: user._id,
            content: message,
            type: "SYSTEM"
        }))
        await Notification.insertMany(notifications)
        console.log(`[NotificationService] Sent ${notifications.length} notifications`);
    }
}