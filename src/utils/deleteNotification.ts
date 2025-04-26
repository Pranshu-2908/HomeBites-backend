import cron from "node-cron";
import Notification from "../models/notificationModel";

cron.schedule("0 0 * * *", async () => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await Notification.deleteMany({
      read: true,
      readAt: { $lte: oneDayAgo },
    });
  } catch (err) {
    console.error("Cron Job Error:", err);
  }
});
