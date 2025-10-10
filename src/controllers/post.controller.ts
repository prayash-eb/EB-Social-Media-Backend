import type { Request, Response, NextFunction } from "express";
import type PostService from "../services/post.service.js";
import type { CloudinaryRequestOptions } from "../middlewares/upload.middleware.js";

export default class PostController {
    constructor(private postService: PostService) { }

    public createUserPost = async (req: CloudinaryRequestOptions, res: Response, next: NextFunction) => {
        try {
            const filePath = req.file?.path ? req.file?.path : (req.cloudinary?.secure_url)
            const postData = { image: filePath, ...req.body }
            const post = await this.postService.createPost(req.user?.id!, postData)
            res.status(201).json({ message: "Post created successfully", post })
        } catch (error) {
            next(error)
        }
    }
    public editUserPost = async (req: CloudinaryRequestOptions, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id!;
            const postId = req.params.id;
            if(!postId){
                return res.status(400).json({message:"Please provide post id."})
            }
            const filePath = req.file?.path ? req.file?.path : req.cloudinary?.secure_url;
            const updateData = { ...req.body };
            if (filePath) {
                updateData.image = filePath;
            }
            console.log(updateData);
            const updatedPost = await this.postService.editPost(userId, postId, updateData);
            res.status(200).json({ message: "Post updated successfully", post: updatedPost });
        } catch (error) {
            next(error);
        }
    }
}