import mongoose, { model, Schema } from "mongoose";
import type { IPost } from "../interfaces/post.interface.js";

const postSchema = new Schema<IPost>({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
        {
            commentorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            comment: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

// Add compound index for efficient querying by userId and createdAt
postSchema.index({ userId: 1, createdAt: -1 });
// Add index for likes and comments if you frequently query them
postSchema.index({ likes: 1 });
postSchema.index({ "comments.commentorId": 1 });

const Post = model<IPost>("Post", postSchema)
export default Post