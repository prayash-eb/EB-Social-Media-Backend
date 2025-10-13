import User from "../models/user.model.js";
import type { IUser } from "../interfaces/user.interface.js";
import type { UserLoginDTO, UserRegisterDTO } from "../dtos/user.dto.js";
import { AppError } from "../libs/customError.js";
import type mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { createHash } from "crypto";

export default class AuthService {

    public login = async (credentials: UserLoginDTO): Promise<string> => {
        const { email, password } = credentials;
        const user = await User.findOne({ email })
        if (!user) {
            throw new AppError("Invalid Credentials", 404, "AUTH_MOUDLE")
        }
        const isPasswordMatched = await user.comparePassword(password)
        if (!isPasswordMatched) {
            throw new AppError("Invalid Credentials", 404, "AUTH_MODULE")
        }
        const accessToken = user.createJWT()
        return accessToken;
    }

    public register = async (credentials: UserRegisterDTO): Promise<IUser> => {
        const { name, email, password } = credentials;
        const user = await User.findOne({ email });
        if (user) {
            throw new AppError("User with email already exists", 409, "AUTH_MODULE");
        }
        const savedUser = await User.create({
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
    public changePassword = async (userId: mongoose.Types.ObjectId, oldPassword: string, newPassword: string): Promise<void> => {
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError("User not Found", 404, "AUTH_MODULE")
        }
        const isOldPasswordCorrect = await user.comparePassword(oldPassword);
        if (!isOldPasswordCorrect) {
            throw new AppError("Old Password doesnot match", 400, "AUTh_MODULE")
        }
        user.password = newPassword;
        await user.save()
    }
    public resetPasswordLink = async (DOMAIN_URL: string, email: string): Promise<string> => {
        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError("User not Found", 400, "AUTH_MODULE")
        }
        // generate resetPassword token using uuid
        const resetPasswordToken = uuidv4()

        // create a sha256 hash and save it into database
        const hashedResetPasswordToken = createHash("sha256").update(resetPasswordToken).digest("hex")

        user.resetPasswordToken = hashedResetPasswordToken
        user.resetPasswordTokenExpiry = new Date(Date.now() + 5 * 60 * 60 * 1000);
        await user.save()

        return `${DOMAIN_URL}/reset-password?token=${resetPasswordToken}`

    }
    public resetPassword = async (newPassword: string, resetToken: string): Promise<void> => {
        const hashedResetPasswordToken = createHash("sha256").update(resetToken).digest("hex")
        const user = await User.findOne({
            resetPasswordToken: hashedResetPasswordToken, resetPasswordTokenExpiry: {
                $gt: new Date(Date.now())
            }
        })
        if (!user) {
            throw new AppError("Invalid Token", 400, "AUTH_MODULE")
        }

        // clear the token & expiry time as well
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiry = undefined;

        // automatically hashed using pre hook on save
        user.password = newPassword;
        await user.save()
    }
}