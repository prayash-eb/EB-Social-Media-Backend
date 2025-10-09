import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import UserService from "../services/user.service.js";
import { Authenticate } from "../middlewares/auth.middleware.js";
import { validateBody, validateQuery } from "../middlewares/validation.middleware.js";
import { userLocationSchema } from "../validators/user.validator.js";




const userRouter: Router = Router()
const userService = new UserService()
const userController = new UserController(userService)


userRouter.post('/update-location', Authenticate, validateBody(userLocationSchema), userController.updateUserLocation)




export default userRouter