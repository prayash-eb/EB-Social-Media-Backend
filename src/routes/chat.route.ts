import { Router } from "express";
import ChatController from "../controllers/chat.controller.js";
import ChatService from "../services/chat.service.js";
import { Authenticate } from "../middlewares/auth.middleware.js";
import { sendMessageSchema, conversationIdSchema } from "../validators/chat.validator.js";
import { validateBody, validateParams } from "../middlewares/validation.middleware.js";

const chatRouter: Router = Router()
const chatService = new ChatService()
const chatController = new ChatController(chatService)

chatRouter.post("/send-message", Authenticate, validateBody(sendMessageSchema), chatController.sendMessage)
chatRouter.get('/messages/:conversationId', Authenticate, validateParams(conversationIdSchema), chatController.getMessages)
chatRouter.patch("/mark-read/:conversationId", Authenticate, validateParams(conversationIdSchema), chatController.markAsRead)
chatRouter.get("/unread-messages", Authenticate, chatController.getUnreadMessages)
chatRouter.get("/unread-messages-count", Authenticate, chatController.getUnreadMessagesCount)

export default chatRouter