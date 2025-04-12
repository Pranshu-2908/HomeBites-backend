import express from "express";
import {
  createCheckoutSession,
  getCheckoutSession,
} from "../controllers/paymentController";

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);
router.get("/session/:sessionId", getCheckoutSession as any);

export default router;
