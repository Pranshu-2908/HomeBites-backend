import { Request, Response } from "express";
import User from "../models/userModel";
import { AuthRequest } from "../middleware/authMiddleware";

// Update User Profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id; // Get user ID from auth middleware
    const {
      phoneNumber,
      location,
      bio,
      certifications,
      profilePicture,
      workingHours,
    } = req.body;

    // Find user & update profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        phoneNumber,
        location,
        bio,
        certifications,
        profilePicture,
        workingHours,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
