import { emailTransporter } from "../configs/nodemailer.js";

export const sendEmail = async (to: string, subject: string, body: string) => {
    try {
        const emailResponse = await emailTransporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html: body,
        });
        if (emailResponse.accepted.includes(to)) {
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
};
