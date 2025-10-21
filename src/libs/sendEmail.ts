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
            console.log(`Email Successfully sent to ${to}`);
            return true;
        }
        return false;
    } catch (error) {
        console.log("Error while sending email", error);
        return false;
    }
};
