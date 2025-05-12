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
  status:
    | "pending"
    | "accepted"
    | "preparing"
    | "completed"
    | "cancelled"
    | "rejected";
  reviewed: boolean;
  paid: boolean;
  createdAt: Date;
  preferredTime: IPreferredTime;
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
        "preparing",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Order: Model<IOrder> = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
