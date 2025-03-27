import express from "express";
import { protectRoute } from "../middleware/authMiddleware";
import {
  createMeal,
  getAllMeals,
  getMealById,
  updateMeal,
  deleteMeal,
} from "../controllers/mealsController";

const router = express.Router();

// Meal Routes
router.post("/", protectRoute as any, createMeal as any);
router.get("/", getAllMeals);
router.get("/:id", getMealById as any);
router.put("/:id", protectRoute as any, updateMeal as any);
router.delete("/:id", protectRoute as any, deleteMeal as any);

export default router;
