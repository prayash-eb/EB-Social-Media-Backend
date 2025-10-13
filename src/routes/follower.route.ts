import { Router } from "express";
import FollowService from "../services/follower.service.js";
import FollowController from "../controllers/follower.controller.js";

import { Authenticate } from "../middlewares/auth.middleware.js";
import { validateBody, validateQuery } from "../middlewares/validation.middleware.js";
import { userChangePasswordSchema, userForgotPasswordSchema, userLoginSchema, userRegisterSchema, userResetPasswordQuerySchema, userResetPasswordSchema } from "../validators/auth.validator.js";

const followRouter = Router()
const followService = new FollowService()
const followController = new FollowController(followService)

followRouter.patch("/follow/:id", Authenticate, followController.followUser)
followRouter.patch("/unfollow/:id", Authenticate, followController.unfollowUser)
followRouter.get("/followers/me", Authenticate, followController.getUserFollowers)
followRouter.get("/followings/me", Authenticate, followController.getUserFollowing)

export default followRouter