import { Router } from "express";
import NotificationController from "../controllers/notification.controller.js";
import NotificationService from "../services/notification.service.js";
import { validateQuery } from "../middlewares/validation.middleware.js";
import { notificationQuerySchema } from "../validators/notification.validator.js";
import { AuthenticateAccessToken } from "../middlewares/auth.middleware.js";

const notificationRouter = Router()

const notificationService = new NotificationService();
const notificationController = new NotificationController(notificationService)

notificationRouter.get('/', AuthenticateAccessToken, validateQuery(notificationQuerySchema), notificationController.getUserNotifications)
export default notificationRouter