import { EmailService } from "../mail.service.js";

export const sendResetPasswordEmail = async (user: {
    name: string;
    email: string;
    resetPasswordLink: string;
    expiryTime: Date;
}) => {
    const emailService = new EmailService();
    await emailService.sendTemplateEmail(user.email, "reset_password_email", {
        user,
    });
};
