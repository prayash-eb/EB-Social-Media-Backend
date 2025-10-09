import User from "../models/user.model.js";
import type { IUser } from "../interfaces/user.interface.js";
import { AppError } from "../libs/customError.js";
import type mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { createHash } from "crypto";
import type { UserLocationDTO } from "../dtos/user.dto.js";

export default class UserService {
    public updateLocation = async (userId: mongoose.Types.ObjectId, locationData: UserLocationDTO) => {
        await User.findByIdAndUpdate(userId, {
            location: {
                type: "Point",
                coordinates: [locationData.longitude, locationData.latitude]
            }
        })
    }
}