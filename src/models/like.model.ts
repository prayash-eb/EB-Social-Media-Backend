import { Schema, model } from "mongoose";

const likeSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    },
    { timestamps: true }
);

// To prevent duplicate likes
likeSchema.index({ userId: 1, postId: 1 }, { unique: true });
likeSchema.index({ postId: 1 });

const Like = model("Like", likeSchema);
export default Like;
