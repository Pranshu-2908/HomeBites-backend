import express from "express";
import {
  registerUser,
  loginUser,
  logout,
  getMe,
} from "../controllers/authController";
import { protectRoute } from "../middleware/authMiddleware";
import { updateProfile } from "../controllers/userContoller";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logout);
router.get("/me", protectRoute as any, getMe as any);
router.put("/profile", protectRoute as any, updateProfile as any);
export default router;
