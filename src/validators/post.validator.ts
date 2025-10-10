import z from "zod"

export const createPostSchema = z.object({
    title: z.string().min(2),
    description: z.string().min(2),
})
export const editPostSchema = z.object({
    title: z.string().min(2).optional(),
    description: z.string().min(2).optional()
})

export type EditPostDTO = z.infer<typeof editPostSchema>;
export type CreatePostDTO = z.infer<typeof createPostSchema>