
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

    public removeUserLocation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            await this.userService.removeLocation(userId!);
            res.status(200).json({ message: "Location Removed Successfully" })
        } catch (error) {
            next(error)
        }
    }

    public updateUserHobby = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id
            const { hobbies } = req.body
            await this.userService.updateHobby(userId!, hobbies)
            res.status(200).json({ message: "Hobbies Added Successfully" })
        } catch (error) {
            next(error)
        }
    }
    public deleteUserHobby = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id
            const { hobbies } = req.body
            await this.userService.deleteHobby(userId!, hobbies)
            res.status(200).json({ message: "Hobbies Delete Successfully" })
        } catch (error) {
            next(error)
        }
    }

    public updateUserDOB = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id
            const { dateOfBirth } = req.body
            await this.userService.updateDateofBirth(userId!, dateOfBirth)
            res.status(200).json({ message: "BirthDay Date Updated Successfully" })
        } catch (error) {
            next(error)
        }
    }
    public deleteUserDOB = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id
            const { dateOfBirth } = req.body
            await this.userService.deleteDateofBirth(userId!)
            res.status(200).json({ message: "BirthDay Date removed Successfully" })
        } catch (error) {
            next(error)
        }
    }
    public addOrUpdateUserAcademics = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id
            const { academicQualifications } = req.body 
            await this.userService.addOrUpdateAcademics(userId!, academicQualifications)
            res.status(200).json({ message: "Academics updated Successfully" })
        } catch (error) {
            next(error)
        }
    }
    // public deleteUserAcademics = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const userId = req.user?.id
    //         const academicId = req.query.id;

    //         await this.userService.deleteAcademics(userId!, academicId)
    //         res.status(200).json({ message: "Academics removed Successfully" })
    //     } catch (error) {
    //         next(error)
    //     }
    // }

}