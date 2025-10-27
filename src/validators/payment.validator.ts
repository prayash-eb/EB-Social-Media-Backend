import z from "zod";

export const createPaymentSchema = z.object({
    senderId: z.string(),
    messageId: z.string(),
});
