import z from "zod";

export const userLoginSchema = z.object({
    email: z.email(),
    password: z.string().min(5)
})

export const userRegisterSchema = z.object({
    name: z.string().min(3),
    email: z.email(),
    password: z.string().min(5)
})

export const userChangePasswordSchema = z.object({
    oldPassword: z.string().min(5),
    newPassword: z.string().min(5)
})

export const userForgotPasswordSchema = z.object({
    email: z.email()
})

export const userResetPasswordSchema = z.object({
    newPassword: z.string().min(5)
})

export const userResetPasswordQuerySchema = z.object({
    token: z.string().nonempty()
})

export const userLocationSchema = z.object({
    longitude: z.number().min(-180).max(180),
    latitude: z.number().min(-90).max(90)

})