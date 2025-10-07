
import { type NextFunction, type Request, type Response } from "express"
import type { AuthService } from "../services/auth.service.js"


export default class AuthController {
    constructor(private authService: AuthService) { }

    public login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const accessToken = await this.authService.login(req.body)
            res.status(200).json({
                token: accessToken
            })
        } catch (error) {
            next(error)
        }
    }

    public register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await this.authService.register(req.body)
            res.status(201).json({ user })
        } catch (error) {
            next(error)
        }
    }

    public profile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id
            console.log(userId);
            const user = await this.authService.getUser(userId!)
            res.status(200).json({
                user
            })
        } catch (error) {
            next(error)
        }
    }
    // static async resetPassword() { }
    // static async forgotPassword() { }
    // static async changePassword() { }


}