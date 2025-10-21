import mongoose, { Schema, model, Document } from "mongoose";

/* 
Example document
{
  name: "welcome_email",
  subject: "Welcome to {{appName}}, {{user.firstName}}!",
  body: `
    <h1>Hi {{user.firstName}},</h1>
    <p>Welcome to {{appName}}! We’re excited to have you on board.</p>
    <p>To get started, <a href="{{loginUrl}}">log in</a>.</p>
    <p>Cheers,<br>The {{appName}} Team</p>
  `,
  description: "Sent when a user signs up",
}
*/

export interface IEmailTemplate extends Document {
    name: string;
    subject: string;
    body: string; // Handlebars template
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

const emailTemplateSchema = new Schema<IEmailTemplate>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            index: true,
            toUpperCase: true,
        },
        subject: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
    },
    { timestamps: true }
);

const EmailTemplate = model<IEmailTemplate>("EmaiLTemplate", emailTemplateSchema);
export default EmailTemplate;
