import PaymentController from "../controllers/payment.controller.js";
import { AuthenticateAccessToken } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validation.middleware.js";
import StripeService from "../providers/stripe.provider.js";
import { Router } from "express";
import { createPaymentSchema } from "../validators/payment.validator.js";
import express from "express";

const paymentRouter = Router();
const paymentService = new StripeService();
const paymentController = new PaymentController(paymentService);

paymentRouter.post(
    "/create-intent",
    AuthenticateAccessToken,
    validateBody(createPaymentSchema),
    paymentController.createPaymentIntent
);
paymentRouter.get("/history", AuthenticateAccessToken, paymentController.getPaymentHistory);

paymentRouter.post(
    "/stripe/webhook",
    express.raw({ type: "application/json" }),
    paymentController.handlePaymentWebhook
);

export default paymentRouter;
