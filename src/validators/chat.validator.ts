import { z } from "zod";
import { ObjectIdValidator } from "./common.validator.js";

export const sendMessageSchema = z.object({
    receiver: z.string(),
    message: z.string().min(1).max(500),
});
export const sendImageMessageSchema = z.object({
    receiver: z.string(),
    price: z.number(),
});
export const conversationIdSchema = z.object({
    conversationId: ObjectIdValidator,
});
