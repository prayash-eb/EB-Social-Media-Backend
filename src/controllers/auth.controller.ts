
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
    public changePassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id!;
            const { oldPassword, newPassword } = req.body
            await this.authService.changePassword(userId, oldPassword, newPassword)
            res.status(200).json({message:"Password changed successfully"})
        } catch (error) {
            next(error)
        }

    }

    public forgotPassword = async(req:Request, res:Response, next:NextFunction) {
        try {
            
        } catch (error) {
            next(error)
        }
     }

    // static async resetPassword() { }


}