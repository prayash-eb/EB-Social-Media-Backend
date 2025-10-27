import NotificationService from "../services/notification.service.js";
import cron from "node-cron";

class NotificationCron {
    constructor(private notificationService: NotificationService) {}

    public getNotificationMessage = () => {
        const messages = [
            "Hey there! See what your friends have been up to!",
            "Something new is happening right now — don’t miss out!",
            "Someone might have interacted with your post — check your feed!",
            "There’s always something happening — come take a look!",
            "Time to share your moment! Post something new today!",
            "You’ve got new stories waiting for you — open the app!",
            "New updates just landed in your feed!",
            "Your friends might be waiting to hear from you — start chatting!",
            "Don’t miss out on trending posts — they’re blowing up right now!",
            "Come back and explore the latest from your community.",
        ];
        return messages[Math.floor(Math.random() * messages.length)] as string;
    };

    public start() {
        const message = this.getNotificationMessage();
        cron.schedule("0 * * * *", async () => {
            console.log("[Cron] Running hourly notification job...");
            await this.notificationService.sendNotificationToAllUsers(message);
        });
    }
}

// create a notificationObject to trigger cron
export const notificationCron = new NotificationCron(new NotificationService());
