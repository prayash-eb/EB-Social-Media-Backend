import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";
import { AuthService } from "../services/auth.service.js";

const authRouter: Router = Router()


const authService = new AuthService()
const authController = new AuthController(authService)

authRouter.post("/register", authController.register)
authRouter.post("/login", authController.login)

// authRouter.post("/reset-password")
// authRouter.post("/forgot-password")
// authRouter.post("/change-password")
// authRouter.get('/profile')

export default authRouter