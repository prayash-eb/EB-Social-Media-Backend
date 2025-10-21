import mongoose from "mongoose";
import { AppError } from "../libs/customError.js";
import EmailTemplate from "../models/email-template.model.js";
import type { CreateTempleteDTO, EditTemplateDTO } from "../validators/email-template.validator.js";

export default class EmailTemplateService {
    public addTemplate = async (templateInfo: CreateTempleteDTO) => {
        const templateAlreadyExist = await EmailTemplate.findOne({
            name: templateInfo.name,
        });
        if (templateAlreadyExist) {
            throw new AppError(
                "Template with same name already exists. You can update existing one",
                400,
                "EMAIL_TEMPLATE_SERVICE"
            );
        }

        const savedTemplate = await EmailTemplate.create({
            ...templateInfo,
        });
        if (!savedTemplate) {
            throw new AppError("Error while creating new template", 400, "EMAIL_TEMPLATE_SERVICE");
        }
        return savedTemplate;
    };
    public getTemplates = async () => {
        return await EmailTemplate.find();
    };

    public getSingleTemplate = async (templateId: string) => {
        const templateObjectId = new mongoose.Types.ObjectId(templateId);
        const template = await EmailTemplate.findById(templateObjectId);
        if (!template) {
            throw new AppError("Template doesnot exist", 404, "EMAIL_TEMPLATE_SERVICE");
        }
        return template;
    };

    public editTemplate = async (templateId: string, updatedData: EditTemplateDTO) => {
        const templateObjectId = new mongoose.Types.ObjectId(templateId);
        const template = await EmailTemplate.findByIdAndUpdate(
            templateObjectId,
            {
                ...updatedData,
            },
            { new: true }
        );
        if (!template) {
            throw new AppError(
                "Template doesnot exist or error while updating template",
                404,
                "TEMPLATE_SERVICE"
            );
        }
        return template;
    };

    public deleteTemplate = async (templateId: string) => {
        const templateObjectId = new mongoose.Types.ObjectId(templateId);
        const deleted = await EmailTemplate.findByIdAndDelete(templateObjectId);
        if (!deleted) {
            throw new AppError("Template does not exist", 400, "EMAIL_TEMPLATE_SERVICE");
        }
    };
}
