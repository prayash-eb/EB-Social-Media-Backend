import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import UserService from "../services/user.service.js";
import { Authenticate } from "../middlewares/auth.middleware.js";
import { validateBody, validateQuery } from "../middlewares/validation.middleware.js";
import { userAcademicsSchema, userBirthdayDateSchema, userHobbySchema, userLocationSchema } from "../validators/user.validator.js";

const userRouter: Router = Router()
const userService = new UserService()
const userController = new UserController(userService)


userRouter.post('/update-location', Authenticate, validateBody(userLocationSchema), userController.updateUserLocation)
userRouter.delete('/remove-location', Authenticate, userController.removeUserLocation)

userRouter.post('/update-hobbies', Authenticate, validateBody(userHobbySchema), userController.updateUserHobby)
userRouter.delete('/delete-hobbies', Authenticate, validateBody(userHobbySchema), userController.deleteUserHobby)

userRouter.post('/update-dob', Authenticate, validateBody(userBirthdayDateSchema), userController.updateUserDOB)
userRouter.delete('/delete-dob', Authenticate, userController.deleteUserDOB)

userRouter.post('/update-academics', Authenticate, validateBody(userAcademicsSchema), userController.addOrUpdateUserAcademics)
// userRouter.delete('/delete-academics/:id', Authenticate, validateBody(userAcademicsSchema), userController.deleteUserAcademics)

export default userRouter