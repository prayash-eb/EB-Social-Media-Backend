import mongoose from "mongoose";
import { AppError } from "../libs/customError.js";
import Post from "../models/post.model.js";
import type { CreateCommentDTO, CreatePostDTO, GetPostsQueryDTO } from "../validators/post.validator.js";
import type { IPost, IComment } from "../interfaces/post.interface.js";
import User from "../models/user.model.js";

export default class PostService {
    public createPost = async (userId: mongoose.Types.ObjectId, data: CreatePostDTO): Promise<IPost> => {
        // Start a session for transaction
        const session = await Post.startSession();
        let newPost: IPost[] | null = null;

        try {
            await session.withTransaction(async () => {
                // Create the post
                newPost = await Post.create([{
                    userId,
                    ...data
                }], { session });

                if (!newPost || newPost.length === 0) {
                    throw new AppError("Error while creating post", 400, "POST_MODULE");
                }

                // Update the user's posts array
                const user = await User.findByIdAndUpdate(
                    userId,
                    { $push: { posts: newPost[0]?._id } },
                    { session }
                );

                if (!user) {
                    throw new AppError("User not found", 404, "POST_MODULE");
                }
            });

            await session.endSession();
            if (!newPost) {
                throw new AppError("Error while creating post", 400, "POST_MODULE");
            }
            return newPost[0];
        } catch (error) {
            await session.endSession();
            throw error;
        }
    }

    public editPost = async (userId: mongoose.Types.ObjectId, postId: mongoose.Types.ObjectId, updateData: Partial<IPost>): Promise<IPost | null> => {
        const post = await Post.findOneAndUpdate(
            { _id: postId, userId },
            { $set: updateData },
            { new: true }
        );
        if (!post) {
            throw new AppError("Post not found or Error while ", 404, "POST_MODULE");
        }
        return post;
    }
    public deletePost = async (userId: mongoose.Types.ObjectId, postId: string) => {
        const deletePost = await Post.findOneAndDelete({
            userId,
            _id: postId
        })
        if (!deletePost) {
            throw new AppError("Post not found", 404, "POST_MODULE")
        }
    }
    public getPost = async (userId: mongoose.Types.ObjectId, postId: string) => {
        const post = await Post.findOne({
            userId,
            _id: postId
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
        const post = await Post.findById(postId);
        if (!post) {
            throw new AppError("Post not found", 404, "POST_MODULE")
        }
        post.likes.push(userId)
        await post.save()
    }
    public commentPost = async (userId: mongoose.Types.ObjectId, postId: string, commentData: CreateCommentDTO) => {
        const post = await Post.findById(postId);
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
        const commentObjectId = new mongoose.Types.ObjectId(commentId);
        const post = await Post.findById(postId).select("userId")
        if (!post) {
            throw new AppError("Post not found", 404, "POST_MODULE")
        }
        const postOwnerId = post.userId
        // delete comment in a single database operation
        const result = await Post.updateOne(
            {
                _id: postId,
                $or: [
                    { userId: postOwnerId },
                    {
                        "comments._id": commentId,
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

        if (result.matchedCount > 0 && result.modifiedCount === 0) {
            throw new AppError("Your arenot authorized to delete this comment", 403, "POST_MODULE")
        }
        if (result.matchedCount === 0) {
            throw new AppError("Comment Not Found", 403, 'POST_MODULE')
        }
    }

}