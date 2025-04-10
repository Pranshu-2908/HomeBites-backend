import express from "express";
import {
  addReview,
  getMealReviews,
  getMealAverageRating,
  getChefAverageRating,
  getTopRatedReviews,
} from "../controllers/reviewController";
import { protectRoute } from "../middleware/authMiddleware";

const router = express.Router();
router.post("/", protectRoute as any, addReview as any);
router.get("/meal/:id", getMealReviews as any);
router.get("/meal/average/:id", getMealAverageRating as any);
router.get("/chef/average/:id", getChefAverageRating as any);
router.get("/top", getTopRatedReviews);

export default router;
