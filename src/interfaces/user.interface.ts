import type { Document } from "mongoose";

export interface ILocation {
    type: "Point",
    coordinates: [number, number]
}

export interface IAcademicQualification {
    passedYear: number;
    degreeName: string;
}

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    hobbies: string[];
    location: ILocation;
    dateOfBirth: string;
    academicQualifications: IAcademicQualification[];
    resetPasswordToken: string | null;
    resetPasswordTokenExpiry: Date | null;
}

export interface IUserModel extends IUser {
    comparePassword(candidatePassword: string): Promise<boolean>;
    createJWT(): string;
}