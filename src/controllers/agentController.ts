import axios from "axios";
import { Request, Response } from "express";

export const queryAgent = async (req: Request, res: Response) => {
  const { message } = req.body;

  try {
    const response = await axios.post(
      "https://homebites-chatbot.onrender.com/query",
      {
        message,
      }
    );
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Error calling FastAPI agent:", error.message);
    res.status(500).json({ error: "Failed to get response from agent" });
  }
};

module.exports = {
  queryAgent,
};
