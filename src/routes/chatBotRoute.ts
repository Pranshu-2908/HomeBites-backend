import express from "express";
import { queryAgent } from "../controllers/agentController";
const router = express.Router();

router.post("/query", queryAgent as any);

export default router;
