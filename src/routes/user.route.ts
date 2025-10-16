import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import UserService from "../services/user.service.js";
import { AuthenticateAccessToken } from "../middlewares/auth.middleware.js";
import { validateBody, validateQuery } from "../middlewares/validation.middleware.js";
import {
    userAcademicsDeleteSchema,
    userAcademicsSchema,
    userBirthdayDateSchema,
    userHobbySchema,
    userLocationSchema,
} from "../validators/user.validator.js";

const userRouter: Router = Router();
const userService = new UserService();
const userController = new UserController(userService);

userRouter.get("/all", userController.getUsers);
userRouter.post(
    "/update-location",
    AuthenticateAccessToken,
    validateBody(userLocationSchema),
    userController.updateUserLocation
);
userRouter.delete("/remove-location", AuthenticateAccessToken, userController.removeUserLocation);
userRouter.post(
    "/update-hobbies",
    AuthenticateAccessToken,
    validateBody(userHobbySchema),
    userController.updateUserHobby
);
userRouter.delete(
    "/delete-hobbies",
    AuthenticateAccessToken,
    validateBody(userHobbySchema),
    userController.deleteUserHobby
);
userRouter.post(
    "/update-dob",
    AuthenticateAccessToken,
    validateBody(userBirthdayDateSchema),
    userController.updateUserDOB
);
userRouter.delete("/delete-dob", AuthenticateAccessToken, userController.deleteUserDOB);
userRouter.post(
    "/update-academics",
    AuthenticateAccessToken,
    validateBody(userAcademicsSchema),
    userController.addOrUpdateUserAcademics
);
userRouter.delete(
    "/delete-academics",
    AuthenticateAccessToken,
    validateBody(userAcademicsDeleteSchema),
    userController.deleteUserAcademics
);

export default userRouter;
