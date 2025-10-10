import type { Request, Response, NextFunction } from "express";
import type PostService from "../services/post.service.js";

export default class PostController {
    constructor(private postService: PostService) { }

    public createPostController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.postService.createPost(req.body)
        } catch (error) {
            next(error)
        }
    }
}