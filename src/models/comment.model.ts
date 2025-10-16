import { Schema, model } from "mongoose";

const commentSchema = new Schema(
    {
        postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        parentCommentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
        content: { type: String, required: true },
    },
    { timestamps: true }
);

// Efficient querying
commentSchema.index({ postId: 1, createdAt: -1, parentCommentId: 1 });

const Comment = model("Comment", commentSchema);
export default Comment;
