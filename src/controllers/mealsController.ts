import { Request, Response } from "express";
import Meal from "../models/mealsModel";
import { AuthRequest } from "../middleware/authMiddleware";

// (chefs)
export const createMeal = async (req: Request, res: Response) => {
  try {
    const { name, description, price, category, images, preparationTime } =
      req.body;
    const chefId = (req as AuthRequest).user?.id; // Get chef's ID from authenticated user

    // Ensure only home chefs can create meals
    if ((req as AuthRequest).user?.role !== "chef") {
      return res.status(403).json({ message: "Only home chefs can add meals" });
    }

    const newMeal = new Meal({
      chefId,
      name,
      description,
      price,
      category,
      images,
      preparationTime,
    });

    await newMeal.save();
    res.status(201).json({
      success: true,
      message: "Meal created successfully",
      meal: newMeal,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// (Public route)
export const getAllMeals = async (req: Request, res: Response) => {
  try {
    const meals = await Meal.find().populate("chefId", "name profilePicture");
    res.status(200).json({ success: true, meals });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// single meal by ID
export const getMealById = async (req: Request, res: Response) => {
  try {
    const { mealId } = req.params;
    const meal = await Meal.findById(mealId).populate(
      "chefId",
      "name profilePicture"
    );

    if (!meal) {
      return res
        .status(404)
        .json({ success: false, message: "Meal not found" });
    }

    res.status(200).json(meal);
  } catch (error) {
    res.status(500).json({ success: true, message: "Server error", error });
  }
};

// (Only by the chef who posted it)
export const updateMeal = async (req: Request, res: Response) => {
  try {
    const { mealId } = req.params;
    const chefId = (req as AuthRequest).user?.id;

    const meal = await Meal.findById(mealId);
    if (!meal) {
      return res
        .status(404)
        .json({ success: false, message: "Meal not found" });
    }

    if (meal.chefId.toString() !== chefId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized to update this meal" });
    }

    const updatedMeal = await Meal.findByIdAndUpdate(mealId, req.body, {
      new: true,
    });
    res.status(200).json({
      success: true,
      message: "Meal updated successfully",
      meal: updatedMeal,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// (Only by the chef who posted it)
export const deleteMeal = async (req: Request, res: Response) => {
  try {
    const { mealId } = req.params;
    const chefId = (req as AuthRequest).user?.id; // Authenticated user (must be the meal's creator)

    const meal = await Meal.findById(mealId);
    if (!meal) {
      return res
        .status(404)
        .json({ success: false, message: "Meal not found" });
    }

    // Ensure only the meal's creator can delete it
    if (meal.chefId.toString() !== chefId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized to delete this meal" });
    }

    await Meal.findByIdAndDelete(mealId);
    res
      .status(200)
      .json({ success: true, message: "Meal deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
