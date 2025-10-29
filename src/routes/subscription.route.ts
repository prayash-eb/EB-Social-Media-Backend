import { Router } from "express";
import SubscriptionController from "../controllers/subscription.controller.js";
import SubscriptionService from "../services/subscription.service.js";
import StripeProvider from "../providers/stripe.provider.js";
import { AuthenticateAccessToken } from "../middlewares/auth.middleware.js";
import express from "express";
import { requireActiveSubscription } from "../middlewares/subscription.middleware.js";

const subscriptionRouter = Router();

const stripeProvider = new StripeProvider();
const subscriptionService = new SubscriptionService(stripeProvider);
const subscriptionController = new SubscriptionController(subscriptionService);

subscriptionRouter.post(
    "/create-sub",
    AuthenticateAccessToken,
    subscriptionController.createUserSubscription
);
subscriptionRouter.post(
    "/update-sub",
    AuthenticateAccessToken,
    requireActiveSubscription,
    subscriptionController.updateUserSubscription
);

subscriptionRouter.post(
    "/attach-payment-method",
    AuthenticateAccessToken,
    requireActiveSubscription,
    subscriptionController.attachPaymentMethod
);

subscriptionRouter.post(
    "/cancel-sub",
    AuthenticateAccessToken,
    requireActiveSubscription,
    subscriptionController.cancelUserSubscription
);
subscriptionRouter.post(
    "/create-intent",
    AuthenticateAccessToken,
    requireActiveSubscription,
    subscriptionController.createPaymentIntent
);

subscriptionRouter.get(
    "/history",
    AuthenticateAccessToken,
    subscriptionController.getTransactionHistory
);

subscriptionRouter.post(
    "/stripe/webhook",
    express.raw({ type: "application/json" }),
    subscriptionController.handleWebHookEvents
);

export default subscriptionRouter;
