import type mongoose from "mongoose";
import type { Document } from "mongoose";

export interface ILocation {
    type: "Point",
    coordinates: [number, number]
    index: "2dsphere"
}

export interface IAcademicQualification {
    id: mongoose.Types.ObjectId;
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
    resetPasswordToken: string | undefined;
    resetPasswordTokenExpiry: Date | undefined;
}

export interface IUserModel extends IUser {
    comparePassword(candidatePassword: string): Promise<boolean>;
    createJWT(): string;
}