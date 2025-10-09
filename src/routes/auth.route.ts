import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";
import AuthService from "../services/auth.service.js";
import { Authenticate } from "../middlewares/auth.middleware.js";
import { validateBody, validateQuery } from "../middlewares/validation.middleware.js";
import { userChangePasswordSchema, userForgotPasswordSchema, userLoginSchema, userRegisterSchema, userResetPasswordQuerySchema, userResetPasswordSchema } from "../validators/user.validator.js";


const authRouter: Router = Router()
const authService = new AuthService()
const authController = new AuthController(authService)

authRouter.post("/register", validateBody(userRegisterSchema), authController.register)

authRouter.post("/login", validateBody(userLoginSchema), authController.login)

authRouter.get('/profile', Authenticate, authController.profile)

authRouter.post("/change-password", Authenticate, validateBody(userChangePasswordSchema), authController.changePassword)

authRouter.post('/forgot-password', validateBody(userForgotPasswordSchema), authController.forgotPassword)

authRouter.post("/reset-password", validateBody(userResetPasswordSchema), validateQuery(userResetPasswordQuerySchema), authController.resetPassword)

export default authRouter