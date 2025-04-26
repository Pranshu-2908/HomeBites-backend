// models/notificationModel.ts
import mongoose, { Model, Schema } from "mongoose";

interface Inotification {
  userId: Schema.Types.ObjectId;
  message: string;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
}

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Notification: Model<Inotification> = mongoose.model<Inotification>(
  "Notification",
  notificationSchema
);

export default Notification;
