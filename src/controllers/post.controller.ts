import type { Request, Response, NextFunction } from "express";
import type PostService from "../services/post.service.js";
import type { CloudinaryRequestOptions } from "../middlewares/upload.middleware.js";
import mongoose from "mongoose";
import type { CreateCommentDTO, CreatePostDTO, GetPostsQueryDTO } from "../validators/post.validator.js";

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
            let postId = req.params.id;
            if (!postId) {
                return res.status(400).json({ message: "Please provide post id." })
            }
            const filePath = req.file?.path ? req.file?.path : req.cloudinary?.secure_url;
            const updateData = { ...req.body };
            if (filePath) {
                updateData.image = filePath;
            }
            const updatedPost = await this.postService.editPost(req.user?.id!, postId, updateData);
            res.status(200).json({ message: "Post updated successfully", post: updatedPost });
        } catch (error) {
            next(error);
        }
    }
    public deleteUserPost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id!
            const postId = req.params.id!;
            await this.postService.deletePost(userId, postId)
            res.status(200).json({ message: "Post deleted Successfully" })
        } catch (error) {
            next(error)
        }
    }
    public getUserPost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id!;
            const postId = req.params.id!;
            const post = await this.postService.getPost(userId, postId)
            res.status(200).json({ message: "Fetched Post Successfully", post })

        } catch (error) {
            next(error)
        }
    }
    public getUserPosts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id!;
            const queries = ((req as any).parsedQuery as unknown) as GetPostsQueryDTO
            const posts = await this.postService.getPosts(userId, queries)
            res.status(200).json({ message: "Fetched Post Successfully", ...posts })
        } catch (error) {
            next(error)
        }
    }
    public likePost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id!;
            const postId = req.params.id!
            await this.postService.likePost(userId, postId)
            res.status(200).json({ message: "Post Liked Successfully" })
        } catch (error) {
            next(error)
        }
    }
    public unLikePost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id!;
            const postId = req.params.id!
            await this.postService.unLikePost(userId, postId)
            res.status(200).json({ message: "Post Like Removed Successfully" })
        } catch (error) {
            next(error)
        }
    }
    public commentPost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id!;
            const postId = req.params.id!;
            const commentData = req.body as CreateCommentDTO
            await this.postService.commentPost(userId, postId, commentData)
            res.status(200).json({ message: "Comment Successfull" })
        } catch (error) {
            next(error)
        }
    }
    public deleteComment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id!;
            const postId = req.params.postId!;
            const commentId = req.params.commentId!
            await this.postService.deleteComment(userId, postId, commentId)
            res.status(200).json({ message: "Comment Deleted Successfully" })
        } catch (error) {
            next(error)
        }
    }
}