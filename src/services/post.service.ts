import mongoose from "mongoose";
import { AppError } from "../libs/customError.js";
import Post from "../models/post.model.js";
import type { CreateCommentDTO, CreatePostDTO, GetPostsQueryDTO } from "../validators/post.validator.js";
import type { IPost, IComment } from "../interfaces/post.interface.js";
import User from "../models/user.model.js";

export default class PostService {
    public createPost = async (userId: mongoose.Types.ObjectId, data: CreatePostDTO): Promise<IPost> => {
        let newPost: IPost | null = null;
        // Create the post
        newPost = await Post.create({
            userId,
            ...data
        });

        if (!newPost) {
            throw new AppError("Error while creating post", 400, "POST_MODULE");
        }
        // Update the user's posts array
        const user = await User.findByIdAndUpdate(
            userId,
            { $push: { posts: newPost._id } },

        );
        if (!user) {
            throw new AppError("User not found", 404, "POST_MODULE");
        }
        if (!newPost) {
            throw new AppError("Error while creating post", 400, "POST_MODULE");
        }
        return newPost!;
    }

    public editPost = async (userId: mongoose.Types.ObjectId, postId: string, updateData: Partial<IPost>): Promise<IPost | null> => {
        const postObjectId = new mongoose.Types.ObjectId(postId)
        const post = await Post.findOneAndUpdate(
            { _id: postObjectId, userId },
            { $set: updateData },
            { new: true }
        );
        if (!post) {
            throw new AppError("Post not found or Error while ", 404, "POST_MODULE");
        }
        return post;
    }
    public deletePost = async (userId: mongoose.Types.ObjectId, postId: string) => {
        const postObjectId = new mongoose.Types.ObjectId(postId)

        const deletePost = await Post.findOneAndDelete({
            userId,
            _id: postObjectId
        })
        if (!deletePost) {
            throw new AppError("Post not found", 404, "POST_MODULE")
        }
    }
    public getPost = async (userId: mongoose.Types.ObjectId, postId: string) => {
        const postObjectId = new mongoose.Types.ObjectId(postId)

        const post = await Post.findOne({
            userId,
            _id: postObjectId
        })
        if (!post) {
            throw new AppError("Post not found", 404, "POST_MODULE")
        }
        return post;
    }
    // implementing pagination while fetching posts for a user
    // ?batch=<number>&page=<number>&sort=asc|desc
    public getPosts = async (userId: mongoose.Types.ObjectId, queries: GetPostsQueryDTO) => {
        const { batch, page, sort } = queries
        const skip = (page - 1) * batch
        // asc:1 and desc:1 in mongoose
        const sortOrder = sort === "asc" ? 1 : -1
        const totalPosts = await Post.countDocuments({
            userId
        })
        const posts = await Post.find({
            userId
        })
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(batch)
            .lean()

        const totalPages = Math.ceil(totalPosts / batch);
        const paginationInfo = {
            totalPosts,
            totalPages,
            currentPage: page,
            batchSize: batch,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages

        }
        return {
            posts,
            paginationInfo
        }
    }
    public likePost = async (userId: mongoose.Types.ObjectId, postId: string) => {
        const postObjectId = new mongoose.Types.ObjectId(postId)
        const post = await Post.findById(postObjectId);
        if (!post) {
            throw new AppError("Post not found", 404, "POST_MODULE")
        }
        // check if already liked
        const alreadyLiked = post.likes.some(
            (id: mongoose.Types.ObjectId) => id.toString() === userId.toString()
        );
        if (alreadyLiked) {
            throw new AppError("You have already liked this post", 409, "POST_MODULE");
        }

        // like the post
        await Post.findByIdAndUpdate(postId, { $push: { likes: userId } });
    }
    public unLikePost = async (userId: mongoose.Types.ObjectId, postId: string) => {
        const postObjectId = new mongoose.Types.ObjectId(postId)

        const post = await Post.findById(postObjectId);
        if (!post) {
            throw new AppError("Post not found", 404, "POST_MODULE")
        }
        // check if not liked yet
        const alreadyLiked = post.likes.some(
            (id: mongoose.Types.ObjectId) => id.toString() === userId.toString()
        );
        if (!alreadyLiked) {
            throw new AppError("You haven't liked this post yet", 409, "POST_MODULE");
        }

        // unlike
        await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
    }
    public commentPost = async (userId: mongoose.Types.ObjectId, postId: string, commentData: CreateCommentDTO) => {
        const postObjectId = new mongoose.Types.ObjectId(postId)
        const post = await Post.findById(postObjectId);
        if (!post) {
            throw new AppError("Post not found", 404, "POST_MODULE")
        }
        post.comments.push({
            ...commentData,
            commentorId: userId,
            createdAt: new Date()
        })
        await post.save()
    }
    public deleteComment = async (userId: mongoose.Types.ObjectId, postId: string, commentId: string) => {
        const postObjectId = new mongoose.Types.ObjectId(postId)
        const commentObjectId = new mongoose.Types.ObjectId(commentId);
        const post = await Post.findById(postObjectId).select("userId")
        if (!post) {
            throw new AppError("Post not found", 404, "POST_MODULE")
        }
        // delete comment in a single database operation
        const result = await Post.updateOne(
            {
                _id: postObjectId,
                $or: [
                    { userId },
                    {
                        "comments._id": commentObjectId,
                        "comments.commentorId": userId
                    }
                ]
            },
            {
                $pull: {
                    comments: {
                        _id: commentObjectId
                    }
                }
            }
        );
        if (result.matchedCount === 0) {
            throw new AppError("Post not found or not authorized", 403, "POST_MODULE");
        }
        if (result.modifiedCount === 0) {
            throw new AppError("Comment not found or not authorized", 403, "POST_MODULE");
        }
    }

}