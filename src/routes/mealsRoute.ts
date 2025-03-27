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
router.post("/", protectRoute as any, createMeal as any).get("/", getAllMeals);
router
  .get("/:id", getMealById as any)
  .delete("/:id", protectRoute as any, deleteMeal as any)
  .put("/:id", protectRoute as any, updateMeal as any);

export default router;
