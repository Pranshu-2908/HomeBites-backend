import express from "express";
import { protectRoute } from "../middleware/authMiddleware";
import {
  placeOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/orderController";

const router = express.Router();

router
  .post("/", protectRoute as any, placeOrder as any)
  .get("/", protectRoute as any, getOrders as any);

router
  .get("/:id", protectRoute as any, getOrderById as any)
  .delete("/:id", protectRoute as any, cancelOrder as any);

router.patch("/:id/status", protectRoute as any, updateOrderStatus as any);

export default router;
