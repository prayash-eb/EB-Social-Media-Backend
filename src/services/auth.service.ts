import User from "../models/user.model.js";
import type { IUser, UserLoginDTO, UserRegisterDTO } from "../interfaces/user.interface.js";
import { AppError } from "../libs/customError.js";
import type mongoose from "mongoose";

export class AuthService {

    public login = async (credentials: UserLoginDTO): Promise<string> => {
        const { email, password } = credentials;
        const userExist = await User.findOne({ email })
        if (!userExist) {
            throw new AppError("Invalid Credentials", 404, "AUTH_MOUDLE")
        }
        const isPasswordMatched = userExist.comparePassword(password)
        if (!isPasswordMatched) {
            throw new AppError("Invalid Credentials", 404, "AUTH_MODULE")
        }
        const accessToken = userExist.createJWT()
        return accessToken;
    }

    public register = async (credentials: UserRegisterDTO): Promise<IUser> => {
        const { name, email, password } = credentials;
        const userExist = await User.findOne({ email });
        if (userExist) {
            throw new AppError("User with email already exists", 409, "AUTH_MODULE");
        }
        const savedUser = await User.insertOne({
            name, email, password
        })
        return savedUser;
    }
    public getUser = async (userId: mongoose.Types.ObjectId): Promise<IUser> => {
        const user = await User.findById(userId)
        if (!user) {
            throw new AppError("User not Found", 404, "AUTH_MODULE")
        }
        return user
    }
}