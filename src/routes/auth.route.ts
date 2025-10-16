import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";
import AuthService from "../services/auth.service.js";
import {
    AuthenticateAccessToken,
    AuthenticateRefreshToken,
} from "../middlewares/auth.middleware.js";
import { validateBody, validateQuery } from "../middlewares/validation.middleware.js";
import {
    userChangePasswordSchema,
    userForgotPasswordSchema,
    userLoginSchema,
    userRegisterSchema,
    userResetPasswordQuerySchema,
    userResetPasswordSchema,
} from "../validators/auth.validator.js";

const authRouter: Router = Router();
const authService = new AuthService();
const authController = new AuthController(authService);

authRouter.post("/register", validateBody(userRegisterSchema), authController.register);
authRouter.post("/login", validateBody(userLoginSchema), authController.login);
authRouter.get("/profile", AuthenticateAccessToken, authController.profile);
authRouter.post(
    "/change-password",
    AuthenticateAccessToken,
    validateBody(userChangePasswordSchema),
    authController.changePassword
);
authRouter.post(
    "/forgot-password",
    validateBody(userForgotPasswordSchema),
    authController.forgotPassword
);
authRouter.post(
    "/reset-password",
    validateBody(userResetPasswordSchema),
    validateQuery(userResetPasswordQuerySchema),
    authController.resetPassword
);
authRouter.get("/logout", AuthenticateAccessToken, authController.logout);
authRouter.get("/logout-all", AuthenticateAccessToken, authController.logoutAllDevices);
authRouter.get("/refresh-token", AuthenticateRefreshToken, authController.refreshToken);

export default authRouter;
