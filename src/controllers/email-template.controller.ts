import type { NextFunction, Request, Response } from "express";
import type EmailTemplateService from "../services/email-template.service.js";

export default class EmailTemplateController {

    constructor(private emailTemplateService: EmailTemplateService) { }

    public addEmailTemplate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const template = await this.emailTemplateService.addTemplate(req.body)
            res.status(201).json({ message: "Template added successfully", template })
        } catch (error) {
            next(error)
        }
    }
    public getAllEmailTemplates = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const templates = await this.emailTemplateService.getTemplates()
            res.status(200).json({ message: "Templates Fetched Successfully", templates })
        } catch (error) {
            next(error)
        }
    }
    public getSingleEmailTemplate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const templateId = req.params.id!;
            const template = await this.emailTemplateService.getSingleTemplate(templateId)
            res.status(200).json({ message: "Template Fetched Successfully", template })
        } catch (error) {
            next(error)
        }
    }
    public editTemplate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const templateId = req.params.id!;
            const template = await this.emailTemplateService.editTemplate(templateId, req.body)
            res.status(200).json({ message: "Template Updated Successfully", template })
        } catch (error) {
            next(error)
        }
    }
    public deleteEmailTemplate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const templateId = req.params.id!;
            await this.emailTemplateService.deleteTemplate(templateId)
        } catch (error) {
            next(error)
        }
    }
}