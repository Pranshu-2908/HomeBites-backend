import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import userRouter from "./routes/userRoute";
import mealRouter from "./routes/mealsRoute";
import orderRouter from "./routes/orderRoute";
import reviewRouter from "./routes/reviewRoutes";
import cartRouter from "./routes/cartRoutes";
import connectDB from "./config/db";
import cookieParser from "cookie-parser";
dotenv.config({ path: "./.env" });

const app = express();
const PORT = process.env.PORT;

// MIDDLEWARES
app.use(cors({ origin: "http://localhost:3001", credentials: true }));
app.use(express.json());
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // To parse form-data
connectDB();

// APP ROUTES
app.use("/api/v1/user", userRouter);
app.use("/api/v1/meal", mealRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/cart", cartRouter);

// SERVER
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
