import mongoose, { Model, model, Schema } from "mongoose";
import type { IUser, IUserModel } from "../interfaces/user.interface.js";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken"

const userSchema = new Schema<IUserModel>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordTokenExpiry: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc: IUserModel, ret: any) {
            ret.id = ret._id
            delete ret._id
            delete ret.password
            delete ret.resetPasswordToken
            delete ret.resetPasswordTokenExpiry
            delete ret.__v
        }
    }
})

userSchema.methods.createJWT = function () {
    const JWT_SECRET = process.env.JWT_SECRET;
    const JWT_EXPIRY_DATE = process.env.JWT_EXPIRY_DATE || "1d";
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is missing from the environment variables");
    }
    return jwt.sign({ id: this._id, email: this.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRY_DATE
    } as SignOptions)
}

userSchema.methods.comparePassword = async function (candidatePassword: string) {
    return await bcrypt.compare(candidatePassword, this.password)
}

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

const User = model<IUserModel>("User", userSchema)

export default User

