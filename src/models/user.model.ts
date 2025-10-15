import mongoose, { model, Schema } from "mongoose";
import type { IUserModel } from "../interfaces/user.interface.js";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken"

const userSchema = new Schema<IUserModel>({
    name: {
        type: String,
        minLength: [3, "Name must be at least 2 characters"],
        trim: true,
        required: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        unique: true
    },
    password: {
        type: String,
        minLength: [6, "Password must be at least 6 characters long"],
        trim: true,
        required: true
    },
    hobbies: {
        type: [String],
    },
    // location.type = "Point"
    location: {
        type: {
            type: String,
            enum: ["Point"]
        },
        // two values in array,first is longitude and second is latitude
        coordinates: {
            type: [Number],
            validate: {
                validator: (value: number[] | []) => {
                    if (!value.length) {
                        return true
                    }
                    return value.length === 2 && value[0]! >= -180 && value[0]! <= 180 && value[1]! >= -90 && value[1]! <= 90;
                },
                message: (prop) => `${prop.value} is not a valid coordinate`
            }
        },
    },
    dateOfBirth: {
        type: String,
        trim: true
    },
    academicQualifications: [{
        id: {
            type: String
        },
        passedYear: {
            type: Number,
            required: true
        },
        degreeName: {
            type: String,
            required: true,
            trim: true
        },
        _id: false
    }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followings: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    resetPasswordToken: {
        type: String,
    },
    resetPasswordTokenExpiry: {
        type: Date
    },
    sessions: [{
        token: String,
        device: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
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

// add location index
userSchema.index({ location: "2dsphere" })

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

