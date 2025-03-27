import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import userRouter from "./routes/userRoute";
import mealRouter from "./routes/mealsRoute";
import orderRouter from "./routes/orderRoute";
import connectDB from "./config/db";
import cookieParser from "cookie-parser";
dotenv.config({ path: "./.env" });

const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARES
app.use(cors());
app.use(express.json());
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // To parse form-data
connectDB();

// APP ROUTES
app.use("/api/v1/auth", userRouter);
app.use("/api/v1/meal", mealRouter);
app.use("/api/v1/order", orderRouter);

// SERVER
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
