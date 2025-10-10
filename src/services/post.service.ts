import type mongoose from "mongoose";
import { AppError } from "../libs/customError.js";
import Post from "../models/post.model.js";
import type { CreatePostDTO } from "../validators/post.validator.js";
import type { IPost } from "../interfaces/post.interface.js";

export default class PostService {
    public createPost = async (userId: mongoose.Types.ObjectId, data: CreatePostDTO): Promise<IPost> => {
        const post = await Post.insertOne({
            userId,
            ...data
        })
        if (!post) {
            throw new AppError("Error while creating post", 400, "POST_MODULE")
        }
        return post
    }
}