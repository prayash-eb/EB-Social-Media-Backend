
import { type NextFunction, type Request, type Response } from "express"
import UserService from "../services/user.service.js"
import type { UserLocationDTO } from "../dtos/user.dto.js"

export default class UserController {
    constructor(private userService: UserService) { }

    public updateUserLocation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            await this.userService.updateLocation(userId!, req.body as UserLocationDTO)
            res.status(200).json({ message: "Location Updated Successfully" })
        } catch (error) {
            next(error)
        }
    }

}