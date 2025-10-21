import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.js";

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.routes.js";
import followRouter from "./routes/follower.route.js";
import chatRouter from "./routes/chat.route.js";
import emailTemplateRouter from "./routes/email-template.route.js";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/post", postRouter);
app.use("/api/v1", followRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/email-template", emailTemplateRouter);

app.get("/", (req: Request, res: Response) => {
    return res.status(200).json({
        status: "OK",
        message: "Server is up",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

app.use((req: Request, res: Response) => {
    return res.status(400).json({ message: "Route doesnot exist" });
});
app.use(errorHandler);

export default app;
