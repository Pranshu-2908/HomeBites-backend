import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import Meal from "../models/mealsModel";
import Order from "../models/orderModel";
import moment from "moment";
import mongoose from "mongoose";

export const getChefStats = async (req: Request, res: Response) => {
  try {
    const chefId = (req as AuthRequest).user.id;
    const chefObjectId = new mongoose.Types.ObjectId(chefId);
    const totalMeals = await Meal.countDocuments({ chefId: chefId });
    const totalOrdersCompleted = await Order.countDocuments({
      chefId: chefId,
      status: "completed",
    });
    const liveOrders = await Order.countDocuments({
      chefId: chefId,
      status: ["preparing", "accepted"],
    });
    const pendingOrders = await Order.countDocuments({
      chefId: chefId,
      status: "pending",
    });

    const revenueAgg = await Order.aggregate([
      { $match: { chefId: chefObjectId, status: "completed" } },
      { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
    ]);

    const revenue = revenueAgg[0]?.totalAmount || 0;

    const topMeal = await Order.aggregate([
      {
        $match: {
          chefId: chefObjectId,
        },
      },
      { $unwind: "$meals" },
      {
        $group: {
          _id: "$meals.mealId",
          count: { $sum: "$meals.quantity" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "meals",
          localField: "_id",
          foreignField: "_id",
          as: "mealInfo",
        },
      },
      { $unwind: "$mealInfo" },
      {
        $project: {
          _id: 0,
          mealName: "$mealInfo.name",
          count: 1,
        },
      },
    ]);

    const mostPopularDish = topMeal[0]?.mealName || "N/A";

    const avgPrepTimeAgg = await Meal.aggregate([
      { $match: { chefId: chefObjectId } }, // Match meals by chefId
      { $group: { _id: null, avgPrepTime: { $avg: "$preparationTime" } } }, // Calculate average preparation time
    ]);

    const avgPrepTime = avgPrepTimeAgg[0]?.avgPrepTime.toFixed(1) || 0;

    res.status(200).json({
      totalMeals,
      totalOrdersCompleted,
      liveOrders,
      revenue,
      mostPopularDish,
      pendingOrders,
      avgPrepTime,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats", error });
  }
};

const OrderTrends = async (chefId: string) => {
  const endDate = moment();
  const startDate = moment().subtract(5, "days");
  const chefObjectId = new mongoose.Types.ObjectId(chefId);

  const orderTrends = await Order.aggregate([
    {
      $match: {
        chefId: chefObjectId,
        createdAt: {
          $gte: startDate.toDate(),
          $lte: endDate.toDate(),
        },
        status: "completed",
      },
    },
    {
      $project: {
        date: {
          $dateToString: {
            format: "%b %d",
            date: "$createdAt",
          },
        },
      },
    },
    {
      $group: {
        _id: "$date",
        orders: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
  const result: { date: string; orders: number }[] = [];

  for (let i = 0; i < 5; i++) {
    const date = moment()
      .subtract(4 - i, "days")
      .format("MMM DD");
    const found = orderTrends.find((entry) => entry._id === date);
    result.push({ date, orders: found ? found.orders : 0 });
  }

  return result;
};

export const getOrderTrends = async (req: Request, res: Response) => {
  const chefId = (req as AuthRequest).user.id;

  try {
    const trends = await OrderTrends(chefId);
    res.json(trends);
  } catch (error) {
    console.error("Error fetching order trends", error);
    res.status(500).json({ message: "Error fetching order trends" });
  }
};
