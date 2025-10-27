import mongoose from "mongoose";
import { Conversation, Message } from "../models/chat.model.js";
import { AppError } from "../libs/customError.js";
import User from "../models/user.model.js";

export default class ChatService {
    public sendMessage = async (
        senderId: mongoose.Types.ObjectId,
        receiverId: string,
        message: string
    ) => {
        const receiverObjectId = new mongoose.Types.ObjectId(receiverId);
        const receiverExist = await User.findById(receiverObjectId);

        if (!receiverExist) {
            throw new AppError("Receiver does not exist", 400, "CHAT_MODULE");
        }

        // Sort participants to keep consistency
        const participants = [senderId, receiverObjectId].sort();

        // Try to find existing conversation
        let conversation = await Conversation.findOne({ participants: { $all: participants } });

        if (!conversation) {
            // Create new conversation
            conversation = new Conversation({ participants });
            await conversation.save();
        }

        // If previously deleted, re-activate for sender
        if (conversation.deletedFor.includes(senderId)) {
            await Conversation.updateOne(
                { _id: conversation._id },
                { $pull: { deletedFor: senderId } }
            );
        }

        // Create and save the message
        const newMessage = new Message({
            sender: senderId,
            receiver: receiverObjectId,
            message,
            conversationId: conversation._id,
        });

        await newMessage.save();

        // Update conversation timestamp
        conversation.updatedAt = new Date();
        await conversation.save();

        return {
            sender: newMessage.sender,
            receiver: newMessage.receiver,
            conversationId: newMessage.conversationId,
            message: newMessage.message,
        };
    };

    public sendImageMessage = async (
        senderId: mongoose.Types.ObjectId,
        receiverId: string,
        imageUrl: string,
        price: number
    ) => {
        const receiverObjectId = new mongoose.Types.ObjectId(receiverId);
        const receiverExist = await User.findById(receiverObjectId);

        if (!receiverExist) {
            throw new AppError("Receiver does not exist", 400, "CHAT_MODULE");
        }

        // Sort participants to keep consistency
        const participants = [senderId, receiverObjectId].sort();

        // Try to find existing conversation
        let conversation = await Conversation.findOne({ participants: { $all: participants } });

        if (!conversation) {
            // Create new conversation
            conversation = new Conversation({ participants });
            await conversation.save();
        }

        // If previously deleted, re-activate for sender
        if (conversation.deletedFor.includes(senderId)) {
            await Conversation.updateOne(
                { _id: conversation._id },
                { $pull: { deletedFor: senderId } }
            );
        }

        // Create and save the message
        const newImageMessage = new Message({
            sender: senderId,
            receiver: receiverObjectId,
            imageUrl,
            price,
            isPaidContent: true,
            conversationId: conversation._id,
        });

        await newImageMessage.save();

        conversation.updatedAt = new Date();

        return {
            sender: newImageMessage.sender,
            receiver: newImageMessage.receiver,
            conversationId: newImageMessage.conversationId,
            isPaidContent: newImageMessage.isPaidContent,
        };
    };

    public getConversations = async (userId: mongoose.Types.ObjectId) => {
        const conversationList = await Conversation.find({
            participants: {
                $in: [userId],
            },
            deletedFor: {
                $ne: userId,
            },
        })
            .sort({ updatedAt: -1 })
            .populate({
                path: "participants",
                select: "_id name", // Adjust to your user model fields
            })
            .lean();

        return conversationList;
    };

    public getMessages = async (userId: mongoose.Types.ObjectId, conversationId: string) => {
        const conversationObjectId = new mongoose.Types.ObjectId(conversationId);
        // find conversation which belongs to this user not others
        const conversation = await Conversation.findOne({
            _id: conversationObjectId,
            participants: { $in: [userId] },
            deletedFor: {
                $ne: userId,
            },
        });
        if (!conversation) {
            throw new AppError("Conversation Not Found", 400, "CHAT_MODULE");
        }

        const messages = await Message.find({
            conversationId: conversationObjectId,
            deletedFor: {
                $ne: userId,
            },
        })
            .sort({ createdAt: 1 })
            .populate("sender", "name")
            .populate("receiver", "name");

        return messages;
    };

    public markAsRead = async (userId: mongoose.Types.ObjectId, conversationId: string) => {
        const conversationObjectId = new mongoose.Types.ObjectId(conversationId);

        const conversation = await Conversation.findOne({
            _id: conversationObjectId,
            participants: {
                $in: [userId],
            },
        });
        if (!conversation) {
            throw new AppError("Conversation Not Found", 400, "CHAT_MODULE");
        }

        // update all messages to read at once.
        const result = await Message.updateMany(
            {
                conversationId: conversationObjectId,
                receiver: userId,
                isRead: false,
            },
            {
                $set: {
                    isRead: true,
                },
            }
        );

        // return count of marked as read message
        return result.modifiedCount;
    };

    public getUnreadMessages = async (userId: mongoose.Types.ObjectId) => {
        const unreadMessages = await Message.find({
            receiver: userId,
            isRead: false,
            deletedFor: { $ne: userId },
        })
            .sort({ createdAt: 1 })
            .populate("sender", "name")
            .populate("receiver", "name");

        return unreadMessages;
    };

    public getUnreadMessagesCount = async (userId: mongoose.Types.ObjectId) => {
        const unreadCounts = await Message.aggregate([
            {
                $match: {
                    isRead: false,
                    receiver: new mongoose.Types.ObjectId(userId),
                    deletedFor: {
                        $ne: userId,
                    },
                },
            },
            {
                $group: {
                    _id: "$conversationId",
                    count: { $sum: 1 },
                    sender: { $first: "$sender" },
                    receiver: { $first: "$receiver" },
                    lastMessageAt: { $max: "$createdAt" },
                },
            },
            {
                $sort: { lastMessageAt: -1 },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "sender",
                    foreignField: "_id",
                    as: "sender",
                },
            },
            // convert array result into object
            { $unwind: "$sender" },
            {
                $lookup: {
                    from: "users",
                    localField: "receiver",
                    foreignField: "_id",
                    as: "receiver",
                },
            },
            { $unwind: "$receiver" },
            {
                $project: {
                    _id: 1,
                    count: 1,
                    "sender._id": 1,
                    "sender.name": 1,
                    "receiver._id": 1,
                    "receiver.name": 1,
                    lastMessageAt: 1,
                },
            },
        ]);
        if (!unreadCounts.length) {
            return {
                count: 0,
            };
        }
        return unreadCounts;
    };

    public deleteConversation = async (userId: mongoose.Types.ObjectId, conversationId: string) => {
        const conversationObjectId = new mongoose.Types.ObjectId(conversationId);
        const conversation = await Conversation.findById(conversationObjectId);
        if (!conversation) {
            throw new AppError("Conversation Not Found", 400, "CHAT_MODULE");
        }

        if (!conversation.participants.includes(userId)) {
            throw new AppError("Forbidden: not a participant", 403, "CHAT_MODULE");
        }
        const updatedConversation = await Conversation.findOneAndUpdate(
            { _id: conversationObjectId },
            { $addToSet: { deletedFor: userId } },
            { new: true }
        );
        // if conversation is deleted from both sides we can delete the conservation as well all its messages
        if (
            updatedConversation &&
            updatedConversation?.deletedFor.length >= updatedConversation?.participants.length
        ) {
            await Message.deleteMany({ conversationId: conversationObjectId });
            await Conversation.deleteOne({ _id: conversationObjectId });
            return;
        }

        await Message.updateMany(
            {
                conversationId: conversationObjectId,
            },
            {
                $addToSet: { deletedFor: userId },
            }
        );
    };

    public deleteMessage = async (userId: mongoose.Types.ObjectId, messageId: string) => {
        const messageObjectId = new mongoose.Types.ObjectId(messageId);
        const message = await Message.findById(messageObjectId);
        if (!message) {
            throw new AppError("Message Not Found", 400, "CHAT_MODULE");
        }
        if (message.sender.equals(userId) && message.receiver.equals(userId)) {
            throw new AppError("Forbidden to delete message", 403, "CHAT_MODULE");
        }
        await Message.updateOne(
            { _id: messageObjectId },
            {
                $addToSet: { deletedFor: userId },
            }
        );
    };
}
