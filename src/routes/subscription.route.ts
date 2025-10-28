import { Router } from "express";
import SubscriptionController from "../controllers/subscription.controller.js";
import SubscriptionService from "../services/subscription.service.js";
import StripeProvider from "../providers/stripe.provider.js";

const subscriptionRouter = Router();

const stripeProvider = new StripeProvider()
const subscriptionService = new SubscriptionService(stripeProvider);
const subscriptionController = new SubscriptionController(subscriptionService);

subscriptionRouter.post("/create", subscriptionController.createUserSubscription);
subscriptionRouter.post("/update", subscriptionController.updateUserSubscription);
subscriptionRouter.post("/create", subscriptionController.cancelUserSubscription);

export default subscriptionRouter;
