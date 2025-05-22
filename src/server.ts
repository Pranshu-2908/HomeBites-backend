import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import userRouter from "./routes/userRoute";
import mealRouter from "./routes/mealsRoute";
import orderRouter from "./routes/orderRoute";
import reviewRouter from "./routes/reviewRoutes";
import cartRouter from "./routes/cartRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import chefRoutes from "./routes/chefRoutes";
import chatbotRoute from "./routes/ChatbotRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import connectDB from "./config/db";
import cookieParser from "cookie-parser";
import http from "http";
import { setupSocket } from "./socket";
import "./utils/deleteNotification";

dotenv.config({ path: "./.env" });

const app = express();
const PORT = process.env.PORT;
const server = http.createServer(app);
// MIDDLEWARES
app.use(
  cors({
    origin: ["http://localhost:3002", "https://homebites.vercel.app"],
    credentials: true,
  })
);

app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
connectDB();

app.set("trust proxy", 1);

// APP ROUTES
app.use("/api/v1/user", userRouter);
app.use("/api/v1/meal", mealRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/chef", chefRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/chatbot", chatbotRoute);

setupSocket(server);
// SERVER
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
