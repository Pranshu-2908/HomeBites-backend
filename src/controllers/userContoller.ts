import { Request, Response } from "express";
import User from "../models/userModel";
import { AuthRequest } from "../middleware/authMiddleware";
import getDataUri from "../utils/dataURI";
import cloudinary from "../utils/cloudinary";

// Update User Profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id; // Get user ID from auth middleware
    const { phoneNumber, location, bio, certifications, workingHours } =
      req.body;
    let profilePicture;

    if (req.file) {
      const file = getDataUri(req.file); // convert to base64 Data URI
      const cloudinaryResponse = await cloudinary.uploader.upload(
        file.content!,
        {
          folder: "homebites/client/public/profile-pictures",
        }
      );
      profilePicture = cloudinaryResponse.secure_url; // get the uploaded image URL
    }

    // Find user & update profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        phoneNumber,
        location,
        bio,
        certifications,
        ...(profilePicture && { profilePicture }),
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
