import z from "zod"

export const notificationQuerySchema = z.object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(5).max(50).optional().default(20)
})