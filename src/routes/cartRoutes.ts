import express from "express";
import { protectRoute } from "../middleware/authMiddleware";
import {
  addToCart,
  clearCart,
  decreaseQty,
  deleteCart,
  getCart,
  increaseQty,
  removeItem,
  saveCart,
} from "../controllers/cartController";

const router = express.Router();

router
  .get("/", protectRoute as any, getCart as any)
  .post("/", protectRoute as any, saveCart)
  .delete("/", protectRoute as any, deleteCart as any);
router.post("/add", protectRoute as any, addToCart as any);
router.patch("/increase", protectRoute as any, increaseQty as any);
router.patch("/decrease", protectRoute as any, decreaseQty as any);
router.delete("/remove", protectRoute as any, removeItem as any);
router.delete("/clear", protectRoute as any, clearCart as any);
export default router;
