import mongoose, { Schema, Document, Model } from "mongoose";
import Meal from "./mealsModel";

export interface IMealOrder {
  mealId: mongoose.Types.ObjectId;
  quantity: number;
}
export interface IPreferredTime {
  hour: number;
  minute: number;
}
export interface IOrder extends Document {
  customerId: mongoose.Types.ObjectId;
  chefId: mongoose.Types.ObjectId;
  meals: IMealOrder[];
  totalAmount: number;
  status: "pending" | "accepted" | "prepared" | "delivered" | "cancelled";
  createdAt: Date;
  preferredTime: IPreferredTime;
  calculateTotalAmount(): Promise<number>;
  updateStatus(newStatus: string): Promise<void>;
}

const orderSchema = new Schema<IOrder>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chefId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    meals: [
      {
        mealId: {
          type: Schema.Types.ObjectId,
          ref: "Meal",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        _id: false,
      },
    ],
    preferredTime: {
      hour: {
        type: Number,
        required: true,
      },
      minute: {
        type: Number,
        required: true,
      },
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "prepared",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

orderSchema.methods.calculateTotalAmount = async function (): Promise<number> {
  let total = 0;
  for (const item of this.meals) {
    const meal = await Meal.findById(item.mealId);
    if (meal) {
      total += meal.price * item.quantity;
    }
  }
  this.totalAmount = total;
  await this.save();
  return total;
};

orderSchema.methods.updateStatus = async function (
  newStatus: string
): Promise<void> {
  if (
    !["pending", "accepted", "prepared", "delivered", "cancelled"].includes(
      newStatus
    )
  ) {
    throw new Error("Invalid status update");
  }
  this.status = newStatus;
  await this.save();
};

const Order: Model<IOrder> = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
