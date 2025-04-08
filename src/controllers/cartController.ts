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
    res.status(500).json({ error: "Failed to save cart." });
  }
};

export const deleteCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user._id;
    await Cart.findOneAndDelete({ user: userId });
    res.status(200).json({ message: "Cart deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete cart." });
  }
};
export const addToCart = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user._id;
  const { mealId, quantity } = req.body;

  try {
    const meal = await Meal.findById(mealId).select("name price quantity");
    if (!meal) return res.status(404).json({ message: "Meal not found" });

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const index = cart.items.findIndex((item) => item.mealId.equals(mealId));
    let updatedItem;

    if (index > -1) {
      cart.items[index].quantity = Math.min(
        cart.items[index].quantity + quantity,
        meal.quantity
      );
      cart.items[index].availableQty = meal.quantity;
      updatedItem = cart.items[index];
    } else {
      const newItem = {
        mealId,
        name: meal.name,
        price: meal.price,
        quantity: Math.min(quantity, meal.quantity),
        availableQty: meal.quantity,
      };
      cart.items.push(newItem);
      updatedItem = newItem;
    }

    await cart.save();
    res
      .status(200)
      .json({ message: "Item added/updated successfully", item: updatedItem });
  } catch (err) {
    res.status(500).json({ message: "Failed to add/update item" });
  }
};

export const increaseQty = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user._id;
  const { mealId } = req.body;

  try {
    const cart = await Cart.findOne({ user: userId });
    const meal = await Meal.findById(mealId).select("quantity");
    if (!cart || !meal) return res.status(404).json({ message: "Not found" });

    const item = cart.items.find((item) => item.mealId.equals(mealId));
    if (item) {
      if (item.quantity < meal.quantity) {
        item.quantity += 1;
      }
      item.availableQty = meal.quantity;
      await cart.save();
    }

    res.status(200).json({ message: "Quantity increased", item });
  } catch (err) {
    res.status(500).json({ message: "Failed to increase quantity" });
  }
};

export const decreaseQty = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user._id;
  const { mealId } = req.body;

  try {
    const cart = await Cart.findOne({ user: userId });
    const meal = await Meal.findById(mealId).select("quantity");
    if (!cart || !meal) return res.status(404).json({ message: "Not found" });

    const index = cart.items.findIndex((item) => item.mealId.equals(mealId));
    let removed = false;

    if (index > -1) {
      if (cart.items[index].quantity > 1) {
        cart.items[index].quantity -= 1;
        cart.items[index].availableQty = meal.quantity;
      } else {
        cart.items.splice(index, 1);
        removed = true;
      }

      await cart.save();
    }

    res.status(200).json({
      message: "Quantity decreased or item removed",
      item: cart.items[index] || null,
      removed,
      mealId,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to decrease quantity" });
  }
};

export const removeItem = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user._id;
  const { mealId } = req.body;

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((item) => !item.mealId.equals(mealId));
    await cart.save();

    res.status(200).json({ message: "Item removed", mealId });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove item" });
  }
};
