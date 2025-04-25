import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "chef" | "customer";
  phoneNumber?: string;
  location?: string;
  bio?: string;
  certifications?: string[];
  profilePicture?: string;
  address?: {
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  workingHours?: {
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
  };
  onBoardingSteps: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["chef", "customer"],
      required: true,
    },
    phoneNumber: String,
    location: String,
    address: {
      addressLine: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    bio: String,
    certifications: [String],
    profilePicture: String,
    workingHours: {
      startHour: {
        type: Number,
      },
      startMinute: {
        type: Number,
      },
      endHour: {
        type: Number,
      },
      endMinute: {
        type: Number,
      },
    },
    onBoardingSteps: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// CONVERT PASSWORD TO HASH
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// VERIFY PASSWORD
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
