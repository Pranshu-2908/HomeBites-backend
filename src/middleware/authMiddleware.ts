import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/userModel";

export interface AuthRequest extends Request {
  user: any;
}

export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Cookies received in middleware:", req.cookies);
    const token = req.cookies?.jwt;
    console.log(token);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token found" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    const user = await User.findById(decoded.id).select("-password");
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    (req as AuthRequest).user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed", error });
  }
};
