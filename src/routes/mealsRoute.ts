import express from "express";
import { protectRoute } from "../middleware/authMiddleware";
import {
  createMeal,
  getAllMeals,
  getMealById,
  updateMeal,
  deleteMeal,
  getChefMeals,
  chefMeals,
} from "../controllers/mealsController";
import { arrayUpload } from "../middleware/multerMiddleware";

const router = express.Router();

// Meal Routes
router
  .post("/", protectRoute as any, arrayUpload, createMeal as any)
  .get("/", getAllMeals);
router.get("/chef", protectRoute as any, getChefMeals as any);

router
  .get("/:id", getMealById as any)
  .delete("/:id", protectRoute as any, deleteMeal as any)
  .put("/:id", protectRoute as any, arrayUpload, updateMeal as any);

router.get("/chef/:chefId", chefMeals as any);
export default router;
