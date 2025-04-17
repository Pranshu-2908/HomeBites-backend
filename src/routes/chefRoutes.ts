import express from "express";
import { protectRoute } from "../middleware/authMiddleware";
import { getChefStats, getOrderTrends } from "../controllers/chefController";

const router = express.Router();

router.get("/stats", protectRoute as any, getChefStats);

router.get("/order-trends", protectRoute as any, getOrderTrends);

export default router;
