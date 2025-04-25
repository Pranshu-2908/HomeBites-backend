import express from "express";
import { registerUser, loginUser, logout } from "../controllers/authController";
import { AuthRequest, protectRoute } from "../middleware/authMiddleware";
import {
  getAllChefs,
  incrementOnboardingStep,
  updateProfile,
  updateUserLocation,
} from "../controllers/userContoller";
import { singleUpload } from "../middleware/multerMiddleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protectRoute as any, (req, res): any => {
  return res.json((req as AuthRequest).user);
});

router.get("/logout", logout);
router.patch(
  "/profile",
  protectRoute as any,
  singleUpload,
  updateProfile as any
);
router.get("/chefs", getAllChefs);
router.put("/update-location", protectRoute as any, updateUserLocation as any);
router.patch(
  "/onboarding-step",
  protectRoute as any,
  incrementOnboardingStep as any
);

export default router;
