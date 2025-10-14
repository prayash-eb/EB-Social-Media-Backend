import { z } from "zod";

export const chatMessageSchema = z.object({
    receiverId: z.string(),
    message: z.string().min(1)
})