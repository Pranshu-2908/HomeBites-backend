import mongoose, { Schema, Document } from "mongoose";

export interface IMeal extends Document {
  chefId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  category: "vegetarian" | "non-veg" | "vegan";
  cuisine: String;
  images: string[];
  preparationTime: number;
  availability: boolean;
  quantity: number;
  createdAt: Date;
}

const MealSchema = new Schema<IMeal>(
  {
    chefId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: ["vegetarian", "non-veg", "vegan"],
      required: true,
    },
    cuisine: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    images: {
      type: [String],
      required: true,
    },
    preparationTime: {
      type: Number,
      required: true,
      min: 1,
    },
    availability: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

MealSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Meal = mongoose.model<IMeal>("Meal", MealSchema);
export default Meal;
