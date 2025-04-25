import { Request, Response } from "express";
import Meal from "../models/mealsModel";
import { AuthRequest } from "../middleware/authMiddleware";
import getDataUri from "../utils/dataURI";
import cloudinary from "../utils/cloudinary";

// (chefs)
export const createMeal = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      category,
      preparationTime,
      quantity,
      cuisine,
    } = req.body;
    const chefId = (req as AuthRequest).user?.id;

    if ((req as AuthRequest).user?.role !== "chef") {
      return res.status(403).json({ message: "Only home chefs can add meals" });
    }
    const images = (req.files as Express.Multer.File[]) || [];
    if (images.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    const uploadFiles = images.map((file) => {
      const fileUri = getDataUri(file);
      return cloudinary.uploader.upload(fileUri.content!);
    });
    const uploadedImages = await Promise.all(uploadFiles);
    const imageUrls = uploadedImages.map((file) => file.secure_url);
    const newMeal = new Meal({
      chefId,
      name,
      description,
      price,
      category,
      cuisine,
      images: imageUrls,
      preparationTime,
      quantity,
    });

    await newMeal.save();
    res.status(201).json({
      success: true,
      message: "Meal created successfully",
      meal: newMeal,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// all access
export const getAllMeals = async (req: Request, res: Response) => {
  try {
    const meals = await Meal.find().populate("chefId", "name address");
    res.status(200).json({ meals });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// single meal by ID
export const getMealById = async (req: Request, res: Response) => {
  try {
    const { id: mealId } = req.params;
    const meal = await Meal.findById(mealId).populate(
      "chefId",
      "name profilePicture workingHours bio location address"
    );

    if (!meal) {
      return res
        .status(404)
        .json({ success: false, message: "Meal not found" });
    }

    res.status(200).json({ meal });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// (Only by the chef who posted it)
export const updateMeal = async (req: Request, res: Response) => {
  try {
    const { id: mealId } = req.params;
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
    const mealData = req.body;
    if (mealData.quantity > 0) {
      mealData.availability = true;
    }
    const updatedMeal = await Meal.findByIdAndUpdate(
      mealId,
      { $set: { ...mealData, updatedAt: Date.now() } },
      {
        new: true,
      }
    );
    res.status(200).json({
      success: true,
      message: "Meal updated successfully",
      meal: updatedMeal,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

export const getChefMeals = async (req: Request, res: Response) => {
  try {
    const chefId = (req as AuthRequest).user?._id;
    const meals = await Meal.find({ chefId }).populate("chefId", "name");
    if (!meals) {
      return res
        .status(404)
        .json({ success: false, message: "No meals found for this chef" });
    }
    res.status(200).json({ meals });
  } catch (error) {
    res.status(500).json({ sucess: false, message: error });
  }
};
export const chefMeals = async (req: Request, res: Response) => {
  try {
    const { chefId } = req.params;
    const meals = await Meal.find({ chefId }).populate(
      "chefId",
      "name address"
    );
    if (!meals) {
      return res
        .status(404)
        .json({ success: false, message: "No meals found for this chef" });
    }
    res.status(200).json({ meals });
  } catch (error) {
    res.status(500).json({ sucess: false, message: error });
  }
};

// (Only by the chef who posted it)
export const deleteMeal = async (req: Request, res: Response) => {
  try {
    const { id: mealId } = req.params;
    const chefId = (req as AuthRequest).user?.id; // Authenticated user (must be the meal's creator)

    const meal = await Meal.findById(mealId);
    if (!meal) {
      return res
        .status(404)
        .json({ success: false, message: "Meal not found" });
    }

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
