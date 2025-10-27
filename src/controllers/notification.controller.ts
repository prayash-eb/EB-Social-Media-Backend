import type { Request, Response, NextFunction } from "express";
import type NotificationService from "../services/notification.service.js";

export default class NotificationController {
    constructor(private notificationService: NotificationService) {}

    public getUserNotifications = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id!;
            const page = Number((req as any).parsedQuery.page);
            const limit = Number((req as any).parsedQuery.limit);
            const notifications = await this.notificationService.getNotifications(
                userId,
                page,
                limit
            );
            res.status(200).json({
                message: "Notifications Fetched Successfully",
                ...notifications,
            });
        } catch (error) {
            next(error);
        }
    };
}
