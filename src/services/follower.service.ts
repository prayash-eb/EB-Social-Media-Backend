import mongoose from "mongoose"
import User from "../models/user.model.js"
import { AppError } from "../libs/customError.js"

export default class FollowService {
    public follow = async (followerId: mongoose.Types.ObjectId, followeeId: string) => {
        if (followerId.toString() === followeeId) {
            throw new AppError("User cannot follow themselves", 400, "FOLLOW_MODULE")
        }

        const [follower, followee] = await Promise.all([
            User.findById(followerId),
            User.findById(followeeId)
        ])

        if (!follower) {
            throw new AppError(
                'Follower does not exist',
                404,
                'FOLLOW_MODULE'
            );
        }

        if (!followee) {
            throw new AppError(
                'Followee does not exist',
                404,
                'FOLLOW_MODULE'
            );
        }
        const followeeObjectId = followee._id as mongoose.Types.ObjectId;
        const followerObjectId = follower._id as mongoose.Types.ObjectId;

        // Prevent duplicate follows
        if (!follower.followings.includes(followeeObjectId)) {
            follower.followings.push(followeeObjectId);
        }

        if (!followee.followers.includes(followerObjectId)) {
            followee.followers.push(followerObjectId);
        }

        await Promise.all([
            follower.save(),
            followee.save()
        ]);
    }
    public unfollow = async (followerId: mongoose.Types.ObjectId, followeeId: string) => {
        if (followerId.toString() === followeeId) {
            throw new AppError("User cannot follow themselves", 400, "FOLLOW_MODULE")
        }

        const [follower, followee] = await Promise.all([
            User.findById(followerId),
            User.findById(followeeId)
        ])

        if (!follower) {
            throw new AppError(
                'Follower does not exist',
                404,
                'FOLLOW_MODULE'
            );
        }

        if (!followee) {
            throw new AppError(
                'Followee does not exist',
                404,
                'FOLLOW_MODULE'
            );
        }
        const followeeObjectId = followee._id as mongoose.Types.ObjectId;
        const followerObjectId = follower._id as mongoose.Types.ObjectId;


        await Promise.all([
            User.findByIdAndUpdate(followerObjectId, {

                $pull: {
                    "followings": followeeObjectId
                }
            }),
            User.findByIdAndUpdate(followeeObjectId, {

                $pull: {
                    "followers": followerObjectId
                }
            })

        ])
    }
    public getFollowers = async (userId: mongoose.Types.ObjectId) => {
        const userWithFollowers = await User.findById(userId).populate("followers", "name email").exec();
        return userWithFollowers?.followers
    }

    public getFollowings = async (userId: mongoose.Types.ObjectId) => {
        const userWithFollowings = await User.findById(userId).populate("followings", "name email").exec()
        return userWithFollowings?.followings
    }
}