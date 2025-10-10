
import { Router } from "express";
import PostController from "../controllers/post.controller.js";
import PostService from "../services/post.service.js";
import { Authenticate } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validation.middleware.js";
import { createPostSchema, editPostSchema } from "../validators/post.validator.js";
import { createLocalImageUploader, createRemoteImageUploader } from "../middlewares/upload.middleware.js";

const postRouter = Router()
const postService = new PostService();
const postController = new PostController(postService)

// local Image uploader middleware
const localFileUploader = createLocalImageUploader
const remoteFileUploader = createRemoteImageUploader


postRouter.post("/create", Authenticate, remoteFileUploader, validateBody(createPostSchema), postController.createUserPost)


postRouter.post("/edit/:id", Authenticate, remoteFileUploader, validateBody(editPostSchema), postController.editUserPost)

export default postRouter