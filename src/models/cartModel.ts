import mongoose, { Schema, Document } from "mongoose";

export interface CartItem {
  mealId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  availableQty: number;
}

export interface CartDocument extends Document {
  user: mongoose.Types.ObjectId;
  items: CartItem[];
}

const CartSchema = new Schema<CartDocument>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [
      {
        mealId: mongoose.Schema.Types.ObjectId,
        name: String,
        price: Number,
        quantity: Number,
        availableQty: Number,
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<CartDocument>("Cart", CartSchema);
