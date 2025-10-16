import { Router } from "express";
import ChatController from "../controllers/chat.controller.js";
import ChatService from "../services/chat.service.js";
import { AuthenticateAccessToken } from "../middlewares/auth.middleware.js";
import { sendMessageSchema, conversationIdSchema } from "../validators/chat.validator.js";
import { validateBody, validateParams } from "../middlewares/validation.middleware.js";

const chatRouter: Router = Router();
const chatService = new ChatService();
const chatController = new ChatController(chatService);

chatRouter.post(
    "/send-message",
    AuthenticateAccessToken,
    validateBody(sendMessageSchema),
    chatController.sendMessage
);
chatRouter.get("/conversations", AuthenticateAccessToken, chatController.getConversationsList);
chatRouter.get(
    "/messages/:conversationId",
    AuthenticateAccessToken,
    validateParams(conversationIdSchema),
    chatController.getConversationMessages
);
chatRouter.patch(
    "/mark-read/:conversationId",
    AuthenticateAccessToken,
    validateParams(conversationIdSchema),
    chatController.markAsRead
);
chatRouter.get("/unread-messages", AuthenticateAccessToken, chatController.getUnreadMessages);
chatRouter.get(
    "/unread-messages-count",
    AuthenticateAccessToken,
    chatController.getUnreadMessagesCount
);

export default chatRouter;
