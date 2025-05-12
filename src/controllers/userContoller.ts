import { Request, Response } from "express";
import User from "../models/userModel";
import { AuthRequest } from "../middleware/authMiddleware";
import getDataUri from "../utils/dataURI";
import cloudinary from "../utils/cloudinary";

// Update User Profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user._id;
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
      addressLine,
      city,
      state,
      pincode,
      coordinates,
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

    if (addressLine || city || state || pincode || coordinates) {
      let parsedCoordinates = {};

      if (typeof coordinates === "string") {
        try {
          parsedCoordinates = JSON.parse(coordinates);
        } catch (err) {
        }
      }
      updateFields.address = {
        ...(addressLine && { addressLine }),
        ...(city && { city }),
        ...(state && { state }),
        ...(pincode && { pincode }),
        ...(parsedCoordinates && {
          coordinates: parsedCoordinates,
        }),
      };
    }

    if (req.file) {
      const file = getDataUri(req.file);
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

export const getAllChefs = async (req: Request, res: Response) => {
  try {
    const chefs = await User.find({ role: "chef" }).select("-password");
    res.status(200).json({ success: true, chefs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// update only coordinates
export const updateUserLocation = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = (req as AuthRequest).user.id;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Coordinates missing" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {
      "address.coordinates.lat": latitude,
      "address.coordinates.lng": longitude,
    });

    res
      .status(200)
      .json({ message: "User location updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const incrementOnboardingStep = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user.id;

  try {
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    user.onBoardingSteps = (user.onBoardingSteps || 0) + 1;
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to update onboarding step" });
  }
};
