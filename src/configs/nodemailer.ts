import { config } from "dotenv";
import nodemailer from "nodemailer";
config()

export const emailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_TRANSPORTER_HOST!,
    port: Number(process.env.EMAIL_TRANSPORTER_PORT!),
    auth: {
        user: process.env.EMAIL_TRANSPORTER_USERNAME!,
        pass: process.env.EMAIL_TRANSPORTER_PASSWORD!
    }
})
