import z from "zod"
export const createPostSchema = z.object({
    title: z.string().min(2),
    description: z.string().min(2),
    image: z.string()
})

export type CreatePostDTO = z.infer<typeof createPostSchema>