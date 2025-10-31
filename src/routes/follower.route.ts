import { Router } from "express";
import FollowService from "../services/follower.service.js";
import FollowController from "../controllers/follower.controller.js";

import { AuthenticateAccessToken } from "../middlewares/auth.middleware.js";
import { validateParams } from "../middlewares/validation.middleware.js";
import { paramIdSchema } from "../validators/common.validator.js";

const followRouter = Router();
const followService = new FollowService();
const followController = new FollowController(followService);

followRouter.use(AuthenticateAccessToken)

followRouter.patch(
    "/follow/:id",
    validateParams(paramIdSchema),
    followController.followUser
);
followRouter.patch(
    "/unfollow/:id",
    validateParams(paramIdSchema),
    followController.unfollowUser
);
followRouter.get("/followers/me", followController.getUserFollowers);
followRouter.get("/followings/me", followController.getUserFollowing);

export default followRouter;
