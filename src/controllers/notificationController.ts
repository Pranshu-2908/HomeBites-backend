import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import Notification from "../models/notificationModel";
import { connectedUsers, io } from "../socket";

export const createNotification = async (userId: string, message: string) => {
  try {
    const notification = await Notification.create({ userId, message });
    const socketId = connectedUsers[userId];
    if (socketId) {
      io.to(socketId).emit("newNotification", notification);
    }
    return notification;
  } catch (error) {
    throw error;
  }
};

export const getUserNotifications = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user._id;

  try {
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true, readAt: new Date() },
      { new: true }
    );
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};
