import express from "express";
import { registerUser, loginUser, logout } from "../controllers/authController";
import { AuthRequest, protectRoute } from "../middleware/authMiddleware";
import { updateProfile } from "../controllers/userContoller";
import { singleUpload } from "../middleware/multerMiddleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protectRoute as any, (req, res): any => {
  return res.json((req as AuthRequest).user); // `req.user` is set in middleware after JWT verification
});

router.get("/logout", logout);
router.patch(
  "/profile",
  protectRoute as any,
  singleUpload,
  updateProfile as any
);
export default router;
