import { Router } from "express";
import EmailTemplateController from "../controllers/email-template.controller.js";
import EmailTemplateService from "../services/email-template.service.js";
import { validateBody, validateParams } from "../middlewares/validation.middleware.js";
import { createTemplateSchema, editTemplateSchema } from "../validators/email-template.validator.js";
import { paramIdSchema } from "../validators/common.validator.js";

const emailTemplateRouter = Router();

const emailTemplateService = new EmailTemplateService()
const emailTemplateController = new EmailTemplateController(emailTemplateService)

emailTemplateRouter.get('/all', emailTemplateController.getAllEmailTemplates)
emailTemplateRouter.get('/:id', emailTemplateController.getSingleEmailTemplate)
emailTemplateRouter.post('/', validateBody(createTemplateSchema), emailTemplateController.addEmailTemplate)
emailTemplateRouter.patch('/:id', validateBody(editTemplateSchema), validateParams(paramIdSchema), emailTemplateController.editTemplate)
emailTemplateRouter.delete('/:id', validateParams(paramIdSchema), emailTemplateController.deleteEmailTemplate)

export default emailTemplateRouter