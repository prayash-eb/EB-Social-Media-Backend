import mongoose from "mongoose";
import { AppError } from "../libs/customError.js";
import Post from "../models/post.model.js";
import type {
    CreateCommentDTO,
    CreatePostDTO,
    GetPostsQueryDTO,
} from "../validators/post.validator.js";
import type { IPost } from "../interfaces/post.interface.js";
import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";
import Like from "../models/like.model.js";
import { commentService } from "./comment.service.js";

export default class PostService {
    public createPost = async (
        userId: mongoose.Types.ObjectId,
        data: CreatePostDTO
    ): Promise<IPost> => {
        let newPost: IPost | null = null;
        // Create the post
        newPost = await Post.create({
            userId,
            ...data,
        });

        if (!newPost) {
            throw new AppError("Error while creating post", 400, "POST_MODULE");
        }
        // Update the user's posts array
        const user = await User.findByIdAndUpdate(userId, { $push: { posts: newPost._id } });
        if (!user) {
            throw new AppError("User not found", 404, "POST_MODULE");
        }
        if (!newPost) {
            throw new AppError("Error while creating post", 400, "POST_MODULE");
        }
        return newPost!;
    };

    public editPost = async (
        userId: mongoose.Types.ObjectId,
        postId: string,
        updateData: Partial<IPost>
    ): Promise<IPost | null> => {
        const postObjectId = new mongoose.Types.ObjectId(postId);
        const post = await Post.findOneAndUpdate(
            { _id: postObjectId, userId },
            { $set: updateData },
            { new: true }
        );
        if (!post) {
            throw new AppError("Post not found or Error while ", 404, "POST_MODULE");
        }
        return post;
    };
    public deletePost = async (userId: mongoose.Types.ObjectId, postId: string) => {
        const postObjectId = new mongoose.Types.ObjectId(postId);
        const deletedPost = await Post.findOneAndDelete({
            userId,
            _id: postObjectId,
        });
        if (!deletedPost) {
            throw new AppError("Post not found", 404, "POST_MODULE");
        }
        const updateComment = Comment.deleteMany({ postId });
        const updateLike = Like.deleteMany({ postId });

        await Promise.all([updateComment, updateLike]);
    };
    public getPost = async (userId: mongoose.Types.ObjectId, postId: string) => {
        const postObjectId = new mongoose.Types.ObjectId(postId);
        const post = await Post.findOne({ userId, _id: postObjectId }).lean();
        if (!post) {
            throw new AppError("Post not found", 404, "POST_MODULE");
        }
        const comments = await Comment.find({
            postId: postObjectId,
            parentCommentId: null,
        })
            .sort({ createdAt: -1 })
            .limit(3)
            .populate("userId", "name")
            .lean();
        return { post, comments };
    };
    // implementing pagination while fetching posts for a user
    // ?batch=<number>&page=<number>&sort=asc|desc
    public getPosts = async (userId: mongoose.Types.ObjectId, queries: GetPostsQueryDTO) => {
        const { batch, page, sort } = queries;
        const skip = (page - 1) * batch;
        // asc:1 and desc:-1 in mongoose
        const sortOrder = sort === "asc" ? 1 : -1;

        const [posts, totalPosts] = await Promise.all([
            Post.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId) } },
                { $sort: { createdAt: sortOrder } },
                { $skip: skip },
                { $limit: batch },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userInfo",
                        pipeline: [{ $project: { _id: 1, name: 1, avatar: 1 } }],
                    },
                },
                { $unwind: "$userInfo" },
            ]),
            Post.countDocuments({ userId }),
        ]);

        const postIds = posts.map((post) => new mongoose.Types.ObjectId(post._id as string));
        const commentsMap = await commentService.getCommentsForPosts(postIds);

        const postsWithComments = posts.map((post) => ({
            ...post,
            comments: commentsMap.get(post._id.toString()) || [],
        }));

        const totalPages = Math.ceil(totalPosts / batch);
        const paginationInfo = {
            totalPosts,
            totalPages,
            currentPage: page,
            batchSize: batch,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
        };
        return {
            postsWithComments,
            paginationInfo,
        };
    };
    public likePost = async (userId: mongoose.Types.ObjectId, postId: string) => {
        const postObjectId = new mongoose.Types.ObjectId(postId);
        const post = await Post.findById(postObjectId);
        if (!post) {
            throw new AppError("Post not found", 404, "LIKE_MODULE");
        }
        // check if already liked
        const alreadyLiked = await Like.findOne({
            userId,
            postId: postObjectId,
        });
        if (alreadyLiked) {
            throw new AppError("You have already liked this post", 409, "LIKE_MODULE");
        }
        // like the post
        const updatedPost = await Post.updateOne(
            { _id: postObjectId },
            { $inc: { likesCount: 1 } }
        );
        if (!updatedPost.modifiedCount) {
            throw new AppError("Error while updating post likes", 400, "LIKE_MODULE");
        }
        await Like.create({ userId, postId: postObjectId });
    };
    public unLikePost = async (userId: mongoose.Types.ObjectId, postId: string) => {
        const postObjectId = new mongoose.Types.ObjectId(postId);

        const post = await Post.findById(postObjectId);
        if (!post) {
            throw new AppError("Post not found", 404, "POST_MODULE");
        }
        // check if not liked yet
        const alreadyLiked = await Like.findOne({
            userId,
            postId: postObjectId,
        });
        if (!alreadyLiked) {
            throw new AppError("You haven't liked this post yet", 409, "POST_MODULE");
        }
        // unlike
        const deletedLike = await Like.deleteOne({ userId, postId });
        if (!deletedLike.deletedCount) {
            throw new AppError("Error while updating likes", 400, "POST_MODULE");
        }
        await Post.updateOne({ _id: postObjectId }, { $inc: { likesCount: -1 } });
    };
    public commentPost = async (
        userId: mongoose.Types.ObjectId,
        postId: string,
        commentData: CreateCommentDTO
    ) => {
        const postObjectId = new mongoose.Types.ObjectId(postId);
        const post = await Post.findById(postObjectId);
        if (!post) {
            throw new AppError("Post not found", 404, "POST_MODULE");
        }
        const updateComment = await Comment.create({
            postId,
            userId,
            ...commentData,
        });

        if (!updateComment) {
            throw new AppError("Error while creating comment", 400, "POST_MODULE");
        }
        await Post.updateOne(
            {
                _id: postId,
            },
            {
                $inc: {
                    commentsCount: 1,
                },
            }
        );
    };
    public deleteComment = async (
        userId: mongoose.Types.ObjectId,
        postId: string,
        commentId: string
    ) => {
        const postObjectId = new mongoose.Types.ObjectId(postId);
        const commentObjectId = new mongoose.Types.ObjectId(commentId);

        // 1️⃣ Make sure post exists
        const post = await Post.findById(postObjectId).select("userId");
        if (!post) {
            throw new AppError("Post not found", 404, "POST_MODULE");
        }

        //   Allow either:
        //  - comment owner (userId === comment.userId)
        //  - or post owner (userId === post.userId)
        const deletedComment = await Comment.deleteOne({
            _id: commentObjectId,
            postId: postObjectId,
            $or: [
                { userId }, // comment owner
                { userId: post.userId }, // post owner
            ],
        });

        if (deletedComment.deletedCount === 0) {
            throw new AppError("Not authorized or comment not found", 403, "COMMENT_MODULE");
        }

        // 3️⃣ Update comment count
        await Post.updateOne({ _id: postObjectId }, { $inc: { commentsCount: -1 } });
    };
    // implementing batch fetching
    public getFeeds = async (userId: mongoose.Types.ObjectId, queries: GetPostsQueryDTO) => {
        const { page, batch, sort } = queries;
        const skip = (page - 1) * batch;
        const sortOrder = sort === "asc" ? 1 : -1;

        const user = await User.findById(userId).select("followings").lean();

        const postQuery = {
            userId: { $in: [userId, ...(user?.followings || [])] },
        };
        const [postFeeds, totalPosts] = await Promise.all([
            Post.find(postQuery)
                .sort({ createdAt: sortOrder })
                .skip(skip)
                .limit(batch)
                .populate("userId", "name")
                .lean(),

            Post.countDocuments(postQuery),
        ]);

        const postIds = postFeeds.map((post) => new mongoose.Types.ObjectId(post._id as string));

        const commentsMap = await commentService.getCommentsForPosts(postIds);

        const postFeedsWithComments = postFeeds.map((post) => ({
            ...post,
            comments: commentsMap.get(post._id.toString()) || [],
        }));

        const totalPages = Math.ceil(totalPosts / batch);
        const paginationInfo = {
            totalPosts,
            totalPages,
            currentPage: page,
            batchSize: batch,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
        };
        return {
            postFeedsWithComments,
            paginationInfo,
        };
    };
}
