import type FollowService from "../services/follower.service.js";
import type { Request, Response, NextFunction } from "express";

export default class FollowController {
    constructor(private followService: FollowService) {}

    public followUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const followerId = req.user?.id!;
            const followeeId = req.params.id!;
            await this.followService.follow(followerId, followeeId);
            res.status(200).json({ message: "User Followed Successfull", followeeId, followerId });
        } catch (error) {
            next(error);
        }
    };
    public unfollowUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const followerId = req.user?.id!;
            const followeeId = req.params.id!;
            await this.followService.unfollow(followerId, followeeId);
            res.status(200).json({
                message: "User unfollowed Successfully",
                unfollowerId: followerId,
                unfolloweeId: followeeId,
            });
        } catch (error) {
            next(error);
        }
    };
    public getUserFollowers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id!;
            const followers = await this.followService.getFollowers(userId);
            res.status(200).json({ message: "Followers Fetched Successfully", followers });
        } catch (error) {
            next(error);
        }
    };
    public getUserFollowing = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id!;
            const followings = await this.followService.getFollowings(userId);
            res.status(200).json({ message: "Followings fetched Successfully", followings });
        } catch (error) {
            next(error);
        }
    };
}
