import type ChatService from "../services/chat.service.js";
import type { Request, Response, NextFunction } from "express";

export default class ChatController {
    constructor(private chatService: ChatService) { }
    public sendMessage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sender = req.user?.id!;
            const { receiver, message } = req.body;
            await this.chatService.sendMessage(sender, receiver, message)
            res.status(200).json({ message: "Message sent successfully", sender, receiver })
        } catch (error) {
            next(error)
        }
    }

    public getMessages = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id!;
            const conversationId = req.params.conversationId!;
            const conversation = await this.chatService.getMessages(userId, conversationId)
            res.status(200).json({ message: "Messages Fetched Successfully", conversation })
        } catch (error) {
            next(error)
        }
    }

    public markAsRead = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id!;
            const conversationId = req.params.conversationId!;
            const markedReadCount = await this.chatService.markAsRead(userId, conversationId)
            res.status(200).json({ message: "Message marked as read", readCount: markedReadCount })
        } catch (error) {
            next(error)
        }
    }

    public getUnreadMessages = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id!;
            const unreadMessages = await this.chatService.getUnreadMessages(userId)
            res.status(200).json({ message: "Fetched Unread messages", unreadMessages })
        } catch (error) {
            next(error)
        }
    }

    public getUnreadMessagesCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id!;
            const unreadCounts = await this.chatService.getUnreadMessagesCount(userId)

            res.status(200).json({
                message: "Fetched Unread Message Counts Successfully",
                unreadCounts
            })
        } catch (error) {
            next(error)
        }
    }

    public deleteConversation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id!;
            const conversationId = req.params.conversationId!
            await this.chatService.deleteConversation(userId, conversationId);
            res.status(200).json({ message: "Conversation Deleted Successfully" })
        } catch (error) {
            next(error)

        }
    }
    public deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id!;
            const messageId = req.params.messageId!
            await this.chatService.deleteConversation(userId, messageId);
            res.status(200).json({ message: "Message Deleted  Successfully" })
        } catch (error) {
            next(error)
        }
    }
}