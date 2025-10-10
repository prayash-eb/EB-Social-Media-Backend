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

    public editPost = async (userId: mongoose.Types.ObjectId, postId: string, updateData: Partial<IPost>): Promise<IPost | null> => {
        const post = await Post.findOneAndUpdate(
            { _id: postId, userId },
            { $set: updateData },
            { new: true }
        );
        if (!post) {
            throw new AppError("Post not found or you are not authorized to edit this post", 404, "POST_MODULE");
        }
        return post;
    }
}