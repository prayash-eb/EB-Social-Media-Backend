
import { Router } from "express";
import PostController from "../controllers/post.controller.js";
import PostService from "../services/post.service.js";
import { Authenticate } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validation.middleware.js";
import { createPostSchema } from "../validators/post.validator.js";

const postRouter = Router()
const postService = new PostService();
const postController = new PostController(postService)

postRouter.post("/create", Authenticate, validateBody(createPostSchema), postController.createPostController)