import { initHandleBars } from "../../configs/handlebars.js";
import { AppError } from "../../libs/customError.js";
import { sendEmail } from "../../libs/sendEmail.js";
import EmailTemplate from "../../models/email-template.model.js"
import type Handlebars from "handlebars";

export class EmailService {
    private hbs: typeof Handlebars
    constructor() {
        this.hbs = initHandleBars()
    }
    public renderEmailTemplate = async (templateName: string, data: Record<string, any>) => {
        const templateDoc = await EmailTemplate.findOne({ name: templateName })
        if (!templateDoc) {
            throw new AppError(`Email template "${templateName}" not found`, 404, "EMAIL_MODULE");
        }
        const compiledSubject = this.hbs.compile(templateDoc.subject)
        const compiledBody = this.hbs.compile(templateDoc.body)

        return { subject: compiledSubject(data), body: compiledBody(data) }
    }

    public sendTemplateEmail = async (to: string, templateName: string, data: Record<string, any>) => {
        const { subject, body } = await this.renderEmailTemplate(templateName, data);
        const emailSent = await sendEmail(to, subject, body)
        if(!emailSent){
            console.log("Error while sending email");
        }
    }
}
