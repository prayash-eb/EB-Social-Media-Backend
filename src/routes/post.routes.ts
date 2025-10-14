import { Router } from "express";
import PostController from "../controllers/post.controller.js";
import PostService from "../services/post.service.js";
import { Authenticate } from "../middlewares/auth.middleware.js";
import { validateBody, validateParams, validateQuery } from "../middlewares/validation.middleware.js";
import { createPostSchema, editPostSchema, getPostsQuerySchema, deleteCommentParamSchema } from "../validators/post.validator.js";
import { paramIdSchema } from "../validators/common.validator.js";
import { createLocalImageUploader, createRemoteImageUploader } from "../middlewares/upload.middleware.js";

const postRouter = Router()
const postService = new PostService();
const postController = new PostController(postService)

// local Image uploader middleware
const localFileUploader = createLocalImageUploader
const remoteFileUploader = createRemoteImageUploader


postRouter.post("/create", Authenticate, remoteFileUploader, validateBody(createPostSchema), postController.createUserPost)
postRouter.post("/edit/:id", Authenticate, remoteFileUploader, validateBody(editPostSchema), postController.editUserPost)
postRouter.delete("/delete/:id", Authenticate, validateParams(paramIdSchema), postController.deleteUserPost)
postRouter.get('/all', Authenticate, validateQuery(getPostsQuerySchema), postController.getUserPosts)
postRouter.get("/:id", Authenticate, validateParams(paramIdSchema), postController.getUserPost)
postRouter.patch("/like/:id", Authenticate, validateParams(paramIdSchema), postController.likePost)
postRouter.patch('/unlike/:id', Authenticate, validateParams(paramIdSchema), postController.unLikePost)
postRouter.patch("/comment/:id", Authenticate, validateParams(paramIdSchema), postController.commentPost)
postRouter.delete('/delete-comment/:postId/:commentId', Authenticate, validateParams(deleteCommentParamSchema), postController.deleteComment)


export default postRouter