import mongoose, { model, Schema } from "mongoose";
import type { IPost } from "../interfaces/post.interface.js";

const postSchema = new Schema<IPost>(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        image: {
            type: String,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        likesCount: {
            type: Number,
            default: 0,
        },
        commentsCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Add compound index for efficient querying by userId and createdAt
postSchema.index({ userId: 1, createdAt: -1 });

const Post = model<IPost>("Post", postSchema);
export default Post;
