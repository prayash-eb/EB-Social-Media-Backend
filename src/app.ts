import express, { type Application, type Request, type Response } from "express";
import cors from "cors"
import authRouter from "./routes/auth.route.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import userRouter from "./routes/user.route.js";

const app: Application = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/user", userRouter)


app.get("/", (req: Request, res: Response) => {
    return res.status(200).json({
        status: "OK",
        message: "Server is up",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

app.use((req: Request, res: Response) => {
    return res.status(400).json({ message: "Route doesnot exist" })
})
app.use(errorHandler)

export default app;