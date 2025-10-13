import mongoose from "mongoose"
import { z } from "zod"

export const ObjectIdValidator = z.string().refine((val: any) => {
    return mongoose.Types.ObjectId.isValid(val)
}, {
    message: "Invalid ObjectId"
})

