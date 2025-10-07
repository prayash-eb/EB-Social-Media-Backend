import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";
import { AuthService } from "../services/auth.service.js";
import { Authenticate } from "../middlewares/auth.middleware.js";

const authRouter: Router = Router()


const authService = new AuthService()
const authController = new AuthController(authService)

authRouter.post("/register", authController.register)
authRouter.post("/login", authController.login)
authRouter.get('/profile', Authenticate, authController.profile)
authRouter.post("/change-password")



// authRouter.post("/reset-password")
// authRouter.post("/forgot-password")

export default authRouter