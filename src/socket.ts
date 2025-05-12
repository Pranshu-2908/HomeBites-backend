import { Server } from "socket.io";
import Notification from "./models/notificationModel";

const connectedUsers: { [userId: string]: string } = {};

let io: Server;

const setupSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3002", "https://homebites.vercel.app"],
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("register", (userId: string) => {
      connectedUsers[userId] = socket.id;
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });
    socket.on("markNotificationsAsRead", (userId) => {
      // Here, you would update the database to mark all notifications as read
      Notification.updateMany({ userId, read: false }, { read: true })
        .then(() => {})
        .catch((err) => {
          console.error("Error marking notifications as read", err);
        });
    });
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      for (const userId in connectedUsers) {
        if (connectedUsers[userId] === socket.id) {
          delete connectedUsers[userId];
          break;
        }
      }
    });
  });
};
export { setupSocket, io, connectedUsers };
