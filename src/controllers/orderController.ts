import { Request, Response } from "express";
import Order from "../models/orderModel";
import Meal from "../models/mealsModel";
import { AuthRequest } from "../middleware/authMiddleware";
import User from "../models/userModel";

// Place an Order
export const placeOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    const { meals, chefId } = req.body;
    if (!meals || meals.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one meal",
      });
    }
    // calculate bill amount
    let totalAmount = 0;
    for (const item of meals) {
      const meal = await Meal.findById(item.mealId);
      if (!meal) {
        return res
          .status(404)
          .json({ success: false, message: `Meal not found: ${item.mealId}` });
      }
      totalAmount += meal.price * item.quantity;
    }
    const newOrder = await Order.create({
      customerId: req.user._id,
      chefId,
      meals,
      totalAmount,
      status: "pending",
      createdAt: new Date(),
    });

    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error placing order", error });
  }
};

// Get Orders (for Customer & Chef only)
export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    let orders;

    // here only customer and chef can fetch orders of their own
    if (req.user.role === "customer") {
      orders = await Order.find({ customerId: req.user._id });
    } else if (req.user.role === "chef") {
      orders = await Order.find({ chefId: req.user._id });
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching orders", error });
  }
};

// Update Order Status (Chef Only)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id: orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });
    console.log(order.chefId.toString(), req.user._id.toString());
    if (order.chefId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // CONFUSION - how to know order delivered?

    if (!["accepted", "prepared", "delivered"].includes(status)) {
      return res.status(400).json({ message: "Invalid status update" });
    }

    order.status = status;
    await order.save();
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: "Error updating order status", error });
  }
};

// Cancel Order (Customer Only)
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id: orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending orders can be cancelled" });
    }

    order.status = "cancelled";
    await order.save();
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling order", error });
  }
};

// Get a Single Order
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id: orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("customerId", "name email")
      .populate("chefId", "name email")
      .populate("meals.mealId", "name price");

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: "Error fetching order details", error });
  }
};
