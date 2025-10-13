import { Document, Types } from "mongoose";

export interface IComment {
    _id?:Types.ObjectId,
    commentorId: Types.ObjectId;
    comment: string;
    createdAt: Date;
}

export interface IPost extends Document {
    title: string;
    description: string;
    image: string;
    userId: Types.ObjectId;
    likes: Types.ObjectId[];
    comments: IComment[];
    createdAt?: Date;
    updatedAt?: Date;
}