import { EmailService } from "../mail.service.js";

export const sendVerificationEmail = async (user: {
    name: string;
    email: string;
    verificationLink: string;
    expiryTime: Date;
}) => {
    const emailService = new EmailService();
    await emailService.sendTemplateEmail(user.email, "email_verification", {
        user,
        appName: "EB Social Media App",
    });
};
