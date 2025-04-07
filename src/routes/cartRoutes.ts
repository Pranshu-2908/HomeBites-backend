import express from "express";
import { protectRoute } from "../middleware/authMiddleware";
import { deleteCart, getCart, saveCart } from "../controllers/cartController";

const router = express.Router();

router
  .get("/", protectRoute as any, getCart as any)
  .post("/", protectRoute as any, saveCart)
  .delete("/", protectRoute as any, deleteCart as any);
export default router;
