import { Router } from "express";
import ChatController from "../controllers/chat.controller.js";
import ChatService from "../services/chat.service.js";
import { AuthenticateAccessToken } from "../middlewares/auth.middleware.js";
import {
    sendMessageSchema,
    conversationIdSchema,
    sendImageMessageSchema,
} from "../validators/chat.validator.js";
import { validateBody, validateParams } from "../middlewares/validation.middleware.js";
import { createRemoteImageUploader } from "../middlewares/upload.middleware.js";

const chatRouter: Router = Router();
const chatService = new ChatService();
const chatController = new ChatController(chatService);


// all routes are authenticated
chatRouter.use(AuthenticateAccessToken)

chatRouter.post(
    "/send-message",
    validateBody(sendMessageSchema),
    chatController.sendMessage
);
chatRouter.post(
    "/send-image",
    createRemoteImageUploader({ folder: "inbox_images" }),
    validateBody(sendImageMessageSchema),
    chatController.sendImageMessage
);

chatRouter.get("/conversations", chatController.getConversationsList);
chatRouter.get(
    "/messages/:conversationId",
    validateParams(conversationIdSchema),
    chatController.getConversationMessages
);
chatRouter.patch(
    "/mark-read/:conversationId",
    validateParams(conversationIdSchema),
    chatController.markAsRead
);
chatRouter.get("/unread-messages", chatController.getUnreadMessages);
chatRouter.get(
    "/unread-messages-count",
    chatController.getUnreadMessagesCount
);

export default chatRouter;
