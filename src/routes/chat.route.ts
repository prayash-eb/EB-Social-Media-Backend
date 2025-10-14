import { Router } from "express";
import ChatController from "../controllers/chat.controller.js";
import ChatService from "../services/chat.service.js";
import { Authenticate } from "../middlewares/auth.middleware.js";

const chatRouter: Router = Router()
const chatService = new ChatService()
const chatController = new ChatController(chatService)

chatRouter.post("/send-message", Authenticate, chatController.sendMessage)
chatRouter.get('/messages/:conversationId', Authenticate, chatController.getMessages)

chatRouter.patch("/mark-read/:conversationId", Authenticate, chatController.markAsRead)

chatRouter.get("/unread-messages", Authenticate, chatController.getUnreadMessages)

chatRouter.get("/unread-messages-count", Authenticate, chatController.getUnreadMessagesCount)

export default chatRouter