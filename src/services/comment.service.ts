import mongoose from "mongoose";
import Comment from "../models/comment.model.js";

export class CommentService {
    public getCommentsForPosts = async (postIds: mongoose.Types.ObjectId[]) => {
        const comments = await Comment.aggregate([
            {
                $match: {
                    postId: { $in: postIds },
                    parentCommentId: null,
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            // join user info from user collection
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "commentor",
                    // select specific fields
                    pipeline: [
                        { $project: { _id: 1, name: 1, avatar: 1 } }, // include only what you need
                    ],
                },
            },
            {
                $unwind: {
                    path: "$commentor",
                },
            },
            {
                $project: {
                    postId: 1,
                    content: 1,
                    createdAt: 1,
                    commentor: 1,
                },
            },
            {
                $group: {
                    _id: "$postId",
                    comments: { $push: "$$ROOT" },
                },
            },
            {
                $project: {
                    comments: { $slice: ["$comments", 3] }, // limit 3 per post
                },
            },
        ]);

        // Convert [{ postId, comments }] → Map(postId => comments[])
        return new Map(comments.map((c) => [c._id.toString(), c.comments]));
    };
}

export const commentService = new CommentService();
