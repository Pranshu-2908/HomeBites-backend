import { Request, Response } from "express";
import Cart from "../models/cartModel";
import { AuthRequest } from "../middleware/authMiddleware";
import Meal from "../models/mealsModel";

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user._id;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(200).json({ items: [] });
    }
    const completeItems = await Promise.all(
      cart.items.map(async (item, ind) => {
        console.log(`item ${ind + 1}`, item);
        const meal = await Meal.findById(item.mealId).select("quantity");

        return {
          mealId: item.mealId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          availableQty: meal?.quantity ?? 0,
        };
      })
    );
    console.log(completeItems);
    res.status(200).json({ items: completeItems });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cart." });
  }
};

export const saveCart = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    const userId = (req as AuthRequest).user._id;

    const existing = await Cart.findOne({ user: userId });

    if (existing) {
      existing.items = items;
      await existing.save();
    } else {
      await Cart.create({ user: userId, items });
    }

    res.status(200).json({ message: "Cart saved successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to save cart." });
  }
};

export const deleteCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user._id;
    console.log(userId);
    await Cart.findOneAndDelete({ user: userId });
    console.log("deleted");
    res.status(200).json({ message: "Cart deleted successfully." });
  } catch (error) {
    console.log("not");
    res.status(500).json({ message: "Failed to delete cart." });
  }
};
