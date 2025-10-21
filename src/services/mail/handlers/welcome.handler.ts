import { EmailService } from "../mail.service.js"

export const sendWelcomeEmail = async (user: { name: string, email: string }) => {
    const emailService = new EmailService()
    await emailService.sendTemplateEmail(user.email, "welcome_email", {
        user,
        appName:"Social Media App",
        loginUrl:"http://localhost:5000"
    })
}