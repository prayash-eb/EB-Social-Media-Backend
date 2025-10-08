import type { Document } from "mongoose";

export interface UserLoginDTO {
    email: string;
    password: string
}
export interface UserRegisterDTO {
    name: string;
    email: string;
    password: string
}
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    resetPasswordToken: string | null,
    resetPasswordTokenExpiry: Date | null
}

export interface IUserModel extends IUser {
    comparePassword(candidatePassword: string): Promise<boolean>;
    createJWT(): string;
}