import z from "zod"
import { ObjectIdValidator } from "./common.validator.js"

export const createPostSchema = z.object({
    title: z.string().min(2),
    description: z.string().min(2),
})
export const editPostSchema = z.object({
    title: z.string().min(2).optional(),
    description: z.string().min(2).optional()
})

export const getPostsQuerySchema = z.object({
    batch: z.coerce.number().min(1).optional().default(5).catch(5),
    page: z.coerce.number().min(1).optional().default(1).catch(1),
    sort: z.enum(["asc", "desc"]).optional().default("desc").catch("desc")
})

export const commentBodyScema = z.object({
    comment: z.string().min(1),
})


export const commentParamSchema = z.object({
    id: ObjectIdValidator
})

export const postParamSchema = z.object({
    id: ObjectIdValidator
})

export const deletePostSchema = z.object({
    id: ObjectIdValidator
})

export const deleteCommentParamSchema = z.object({
    postId: ObjectIdValidator,
    commentId: ObjectIdValidator
})


export type CreateCommentDTO = z.infer<typeof commentBodyScema>
export type GetPostsQueryDTO = z.infer<typeof getPostsQuerySchema>
export type EditPostDTO = z.infer<typeof editPostSchema>
export type CreatePostDTO = z.infer<typeof createPostSchema>