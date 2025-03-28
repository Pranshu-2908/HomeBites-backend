import mongoose from "mongoose";

export interface IReview extends mongoose.Document {
  customerId: mongoose.Types.ObjectId;
  chefId?: mongoose.Types.ObjectId;
  mealId?: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const ReviewSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chefId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    mealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meal",
      required: false,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model<IReview>("Review", ReviewSchema);
export default Review;
