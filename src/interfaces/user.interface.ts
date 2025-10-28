import type mongoose from "mongoose";
import type { Document } from "mongoose";

export interface ILocation {
    type: "Point";
    coordinates: [number, number];
}

export interface IAcademicQualification {
    id: string;
    passedYear: number;
    degreeName: string;
}

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    hobbies: string[];
    location: ILocation;
    dateOfBirth: string | undefined;
    academicQualifications: IAcademicQualification[];
    posts: [mongoose.Types.ObjectId];
    followers: [mongoose.Types.ObjectId];
    followings: [mongoose.Types.ObjectId];
    resetPasswordToken: string | undefined;
    resetPasswordTokenExpiry: Date | undefined;
    isEmailVerified: boolean;
    stripeCustomerId?: string;
    stripeAccountId?: string;
    subscriptionId?: string;
    subscriptionStatus: string;
    emailVerificationToken: string | undefined;
    emailVerificationTokenExpiry: Date | undefined;
}

export interface IUserModel extends IUser {
    comparePassword(candidatePassword: string): Promise<boolean>;
    createTokens(): { jti: string; accessToken: string; refreshToken: string };
}
