import { Request, Response } from "express";
import Review from "../models/reviewModel";
import Order from "../models/orderModel";
import { AuthRequest } from "../middleware/authMiddleware";
import mongoose from "mongoose";
import Meal from "../models/mealsModel";

// Add a Review
export const addReview = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, mealReviews } = req.body;
    const customerId = req.user._id;

    // valid request or not
    if (!orderId || !mealReviews || !mealReviews.length) {
      return res.status(400).json({
        message: "Order ID and at least one meal review are required.",
      });
    }

    // order done or not
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // cant review
    if (order.customerId.toString() !== customerId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to review this order." });
    }

    let chefId = order.chefId.toString();

    let reviewsToSave = []; // array to save review of each meal
    if (order.status !== "completed") {
      return res
        .status(403)
        .json({ message: "You can review only after order is completed" });
    }
    for (const mealReview of mealReviews) {
      const { mealId, rating, comment } = mealReview;

      // is the meal in the order list or not?????
      const mealExists = order.meals.some(
        (meal) => meal.mealId.toString() === mealId
      );
      if (!mealExists) {
        return res
          .status(400)
          .json({ message: `Meal ${mealId} was not in your order.` });
      }

      // was it reviewed before?????
      const existingReview = await Review.findOne({
        orderId,
        customerId,
        mealId,
      });
      if (existingReview) {
        return res
          .status(400)
          .json({ message: `You have already reviewed a meal` });
      }

      //push if all check passes
      reviewsToSave.push({
        customerId,
        orderId,
        mealId,
        chefId,
        rating,
        comment,
      });
    }

    await Review.insertMany(reviewsToSave);
    // update the average rating in Meals schema
    for (const review of reviewsToSave) {
      const mealId = review.mealId;

      const result = await Review.aggregate([
        { $match: { mealId: new mongoose.Types.ObjectId(mealId) } },
        {
          $group: {
            _id: "$mealId",
            averageRating: { $avg: "$rating" },
          },
        },
      ]);

      const average = result[0]?.averageRating.toFixed(2) ?? 0;

      await Meal.findByIdAndUpdate(mealId, { averageRating: average });
    }
    // update the reviewed status in Order schema
    await Order.findByIdAndUpdate(orderId, { reviewed: true });
    res.status(201).json({
      success: true,
      message: "Reviews submitted successfully.",
      reviews: reviewsToSave,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Reviews for a Meal
export const getMealReviews = async (req: Request, res: Response) => {
  try {
    const { id: mealId } = req.params;

    if (!mealId) {
      return res.status(400).json({ message: "Provide a mealId." });
    }

    const reviews = await Review.find({ mealId }).populate(
      "customerId",
      "name profilePicture"
    );

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Average Rating for a Meal
export const getMealAverageRating = async (req: Request, res: Response) => {
  try {
    const { id: mealId } = req.params;

    if (!mealId) {
      return res.status(400).json({ message: "Provide a mealId." });
    }

    const reviews = await Review.find({ mealId });

    if (reviews.length === 0) {
      return res
        .status(200)
        .json({ success: true, averageRating: 0, totalReviews: 0 });
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    res.status(200).json({
      success: true,
      averageRating: parseFloat(averageRating.toFixed(2)),
      totalReviews: reviews.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Chef's Average Rating (Calculated from Meal Ratings)
export const getChefAverageRating = async (req: Request, res: Response) => {
  try {
    const { id: chefId } = req.params;

    if (!chefId) {
      return res.status(400).json({ message: "Provide a chefId." });
    }

    const reviews = await Review.find({ chefId });

    if (reviews.length === 0) {
      return res
        .status(200)
        .json({ success: true, averageRating: 0, totalReviews: 0 });
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    res.status(200).json({
      success: true,
      averageRating: parseFloat(averageRating.toFixed(2)),
      totalReviews: reviews.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// top-6 for landing page
export const getTopRatedReviews = async (req: Request, res: Response) => {
  try {
    const topReviews = await Review.find()
      .sort({ rating: -1, createdAt: -1 })
      .limit(6)
      .populate("customerId", "name profilePicture")
      .populate("chefId", "name");

    res.status(200).json({ success: true, reviews: topReviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
