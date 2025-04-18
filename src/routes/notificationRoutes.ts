// routes/notificationRoutes.ts
import express from "express";
import {
  getUserNotifications,
  markNotificationAsRead,
} from "../controllers/notificationController";
import { protectRoute } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", protectRoute as any, getUserNotifications);
router.patch("/:id/read", protectRoute as any, markNotificationAsRead);

export default router;
