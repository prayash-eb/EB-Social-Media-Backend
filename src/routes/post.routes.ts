import { Router } from "express";
import PostController from "../controllers/post.controller.js";
import PostService from "../services/post.service.js";
import { AuthenticateAccessToken } from "../middlewares/auth.middleware.js";
import {
    validateBody,
    validateParams,
    validateQuery,
} from "../middlewares/validation.middleware.js";
import {
    createPostSchema,
    editPostSchema,
    getPostsQuerySchema,
    deleteCommentParamSchema,
} from "../validators/post.validator.js";
import { paramIdSchema } from "../validators/common.validator.js";
import {
    createLocalImageUploader,
    createRemoteImageUploader,
} from "../middlewares/upload.middleware.js";
import { requireActiveSubscription } from "../middlewares/subscription.middleware.js";

const postRouter = Router();
const postService = new PostService();
const postController = new PostController(postService);

postRouter.use(AuthenticateAccessToken);

postRouter.post(
    "/create",
    requireActiveSubscription,
    createRemoteImageUploader({ folder: "post_images" }),
    validateBody(createPostSchema),
    postController.createUserPost
);
postRouter.post(
    "/edit/:id",
    createRemoteImageUploader({ folder: "post_images" }),
    validateBody(editPostSchema),
    postController.editUserPost
);
postRouter.delete(
    "/delete/:id",
    validateParams(paramIdSchema),
    postController.deleteUserPost
);
postRouter.get(
    "/all",
    validateQuery(getPostsQuerySchema),
    postController.getUserPosts
);
postRouter.patch(
    "/like/:id",
    validateParams(paramIdSchema),
    postController.likePost
);
postRouter.patch(
    "/unlike/:id",
    validateParams(paramIdSchema),
    postController.unLikePost
);
postRouter.patch(
    "/comment/:id",
    validateParams(paramIdSchema),
    postController.commentPost
);
postRouter.delete(
    "/delete-comment/:postId/:commentId",
    validateParams(deleteCommentParamSchema),
    postController.deleteComment
);
postRouter.get(
    "/feeds",
    validateQuery(getPostsQuerySchema),
    postController.listUserFeeds
);
postRouter.get(
    "/:id",
    validateParams(paramIdSchema),
    postController.getUserPost
);

export default postRouter;
