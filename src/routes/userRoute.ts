import express from "express";
import { registerUser, loginUser, logout } from "../controllers/authController";
import { protectRoute } from "../middleware/authMiddleware";
import { updateProfile } from "../controllers/userContoller";
import { singleUpload } from "../middleware/multerMiddleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logout);
router.patch(
  "/profile",
  protectRoute as any,
  singleUpload,
  updateProfile as any
);
export default router;
