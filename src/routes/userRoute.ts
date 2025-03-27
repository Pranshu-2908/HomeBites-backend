import express from "express";
import {
  registerUser,
  loginUser,
  logout,
  checkAuth,
} from "../controllers/authController";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logout);
router.get("/check-auth", checkAuth);

export default router;
