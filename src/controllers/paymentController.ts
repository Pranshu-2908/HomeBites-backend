import Stripe from "stripe";
import { Request, Response } from "express";
import Order from "../models/orderModel";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { cartItems } = req.body;

    const line_items = cartItems.map((item: any) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));
    console.log(req.body.orderId);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      metadata: {
        orderId: req.body.orderId,
      },
      customer_email: req.body.email,
      billing_address_collection: "required",
      success_url: `http://localhost:3001/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3001/payment-fail`,
    });
    console.log(session.metadata);
    res.json({ url: session.url });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getCheckoutSession = async (req: Request, res: Response) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId
    );
    console.log(req.params.sessionId);
    const orderId = session.metadata?.orderId;
    console.log(orderId);
    if (!orderId) {
      return res
        .status(404)
        .json({ message: "Order ID not found in session metadata." });
    }
    if (session.payment_status === "paid") {
      await Order.findByIdAndUpdate(orderId, { paid: true });
    }

    res.status(200).json({ orderId });
  } catch (error: any) {
    res
      .status(400)
      .json({ message: "Failed to retrieve session", error: error.message });
  }
};
