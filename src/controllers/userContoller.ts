import { Request, Response } from "express";
import User from "../models/userModel";
import { AuthRequest } from "../middleware/authMiddleware";
import getDataUri from "../utils/dataURI";
import cloudinary from "../utils/cloudinary";

// Update User Profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id; // Get user ID from auth middleware
    const {
      name,
      phoneNumber,
      location,
      bio,
      certifications,
      startHour,
      startMinute,
      endHour,
      endMinute,
    } = req.body;
    let profilePicture;
    const updateFields: any = {};

    if (name) updateFields.name = name;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    if (location) updateFields.location = location;
    if (bio) updateFields.bio = bio;
    if (certifications) updateFields.certifications = certifications;

    // Add workingHours only if at least one part is present
    if (
      startHour !== undefined ||
      startMinute !== undefined ||
      endHour !== undefined ||
      endMinute !== undefined
    ) {
      updateFields.workingHours = {
        ...(startHour !== undefined && { startHour: Number(startHour) }),
        ...(startMinute !== undefined && { startMinute: Number(startMinute) }),
        ...(endHour !== undefined && { endHour: Number(endHour) }),
        ...(endMinute !== undefined && { endMinute: Number(endMinute) }),
      };
    }
    if (req.file) {
      const file = getDataUri(req.file); // convert to base64 Data URI
      const cloudinaryResponse = await cloudinary.uploader.upload(
        file.content!,
        {
          folder: "homebites/client/public/profile-pictures",
        }
      );
      profilePicture = cloudinaryResponse.secure_url;
      updateFields.profilePicture = profilePicture;
    }

    const workingHours = {
      startHour: Number(startHour),
      startMinute: Number(startMinute),
      endHour: Number(endHour),
      endMinute: Number(endMinute),
    };
    console.log(workingHours);
    // Find user & update profile
    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
    });

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
