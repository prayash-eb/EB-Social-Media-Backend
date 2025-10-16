import { type NextFunction, type Request, type Response } from "express";
import UserService from "../services/user.service.js";
import type { UserLocationDTO } from "../validators/user.validator.js";
import User from "../models/user.model.js";

export default class UserController {
    constructor(private userService: UserService) {}

    // test controller for easy fetching for all users
    public getUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (process.env.NODE_ENV === "prod") {
                return res.status(403).json({ message: "Unauthorized route" });
            }
            const users = await User.find();
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    };

    public updateUserLocation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            await this.userService.updateLocation(userId!, req.body as UserLocationDTO);
            res.status(200).json({ message: "Location Updated Successfully" });
        } catch (error) {
            next(error);
        }
    };

    public removeUserLocation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            await this.userService.removeLocation(userId!);
            res.status(200).json({ message: "Location Removed Successfully" });
        } catch (error) {
            next(error);
        }
    };

    public updateUserHobby = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            await this.userService.updateHobby(userId!, req.body);
            res.status(200).json({ message: "Hobbies Added Successfully" });
        } catch (error) {
            next(error);
        }
    };
    public deleteUserHobby = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            await this.userService.deleteHobby(userId!, req.body);
            res.status(200).json({ message: "Hobbies Delete Successfully" });
        } catch (error) {
            next(error);
        }
    };

    public updateUserDOB = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            await this.userService.updateDateofBirth(userId!, req.body);
            res.status(200).json({ message: "BirthDay Date Updated Successfully" });
        } catch (error) {
            next(error);
        }
    };
    public deleteUserDOB = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            await this.userService.deleteDateofBirth(userId!);
            res.status(200).json({ message: "BirthDay Date removed Successfully" });
        } catch (error) {
            next(error);
        }
    };
    public addOrUpdateUserAcademics = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            await this.userService.addOrUpdateAcademics(userId!, req.body);
            res.status(200).json({ message: "Academics updated Successfully" });
        } catch (error) {
            next(error);
        }
    };
    public deleteUserAcademics = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            await this.userService.deleteAcademics(userId!, req.body);
            res.status(200).json({ message: "Academics removed Successfully" });
        } catch (error) {
            next(error);
        }
    };
}
