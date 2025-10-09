import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const USER_ROLE = [
  "student",
  "vendor_admin",
  "club_admin",
  "moderator",
  "admin",
];
const HOSTELS = ["kanhar", "Gopad", "Indravati", "Shivnath"];
const ratingStatsSchema = new Schema(
  {
    count: { type: Number, default: 0 },
    avg: { type: Number, default: 0, min: 0, max: 5 },
    breakdown: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    },
  },
  { _id: false }
);
const hostelLocationSchema = new Schema(
  {
    hostel: { type: String, enum: HOSTELS },
    room: { type: String, trim: true },
    notes: String,
  },
  { _id: false }
);
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },

    domainVerified: {
      //@iitbhilai.ac.in
      type: Boolean,
      default: false,
    },
    phone: { type: String, sparse: true },
    whatsapp: { type: String },
    roles: {
      type: [String],
      enum: USER_ROLE,
      default: ["student"],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && new Set(v).size === v.length;
        },
        message: "Duplicate roles are not allowed.",
      },
    },
    profileImage: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
    },
    refreshTokens: [
      {
        token: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    preferences: {
      darkMode: { type: Boolean, default: false },
      language: { type: String, default: "en" },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
      },
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
    cart: [
      {
        listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
        quantity: { type: Number, default: 1 },
      },
    ],
    hostelLocation: hostelLocationSchema,
    ratingAsSeller: ratingStatsSchema,
    ratingAsBuyer: ratingStatsSchema,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
userSchema.index({ username: 1, email: 1 });

export const User = mongoose.model("User", userSchema);
