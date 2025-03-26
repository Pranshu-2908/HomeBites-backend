import { CookieOptions, Request, Response } from "express";
import User from "../models/userModel";
import jwt from "jsonwebtoken";

const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "", {
    expiresIn: "30d",
  });
};

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({
        stauts: false,
        message: "User already exists",
      });
      return;
    }
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
    });

    if (!user) {
      res.status(400).json({ message: "Invalid user data" });
      return;
    }
    const token = generateToken(user._id.toString());
    const cookieOptions: CookieOptions = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    };
    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions);
    res.status(201).json({
      user,
      message: "User created successfully",
      token,
    });
  } catch (error: any) {
    res.status(400).json({
      message: "Invalid user data",
      error: error.message,
    });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    const token = generateToken(user._id.toString());
    res.json({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      token,
      message: "Logged in successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      message: "Login failed",
      error: error.message,
    });
  }
};
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.cookie("jwt", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
