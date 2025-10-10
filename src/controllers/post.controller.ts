import type { Request, Response, NextFunction } from "express";
import type PostService from "../services/post.service.js";
import type { CloudinaryRequestOptions } from "../middlewares/upload.middleware.js";

export default class PostController {
    constructor(private postService: PostService) { }

    public createPostController = async (req: CloudinaryRequestOptions, res: Response, next: NextFunction) => {
        try {
            const filePath = req.file?.path ? req.file?.path : (req.cloudinary?.secure_url)
            const postData = { image: filePath, ...req.body }
            const post = await this.postService.createPost(req.user?.id!, postData)
            res.status(201).json({ message: "Post created successfully", post })
        } catch (error) {
            next(error)
        }
    }
}