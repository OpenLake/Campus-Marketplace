import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ApiError } from "../utils/api-error";

const USER_ROLE = [
  "student",
  "vendor_admin",
  "club_admin",
  "moderator",
  "admin",
];
const HOSTELS = ["kanhar", "Gopad", "Indravati", "Shivnath"];
const DEPARTMENTS = ["CSE", "ECE", "ME", "EE", "MT", "MSME", "DSAI"];
const YEARS = ["1st", "2nd", "3rd", "4th"];

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
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [
        /^[A-Za-z0-9._%+-]+@iitbhilai\.ac\.in$/,
        "Email must be an IIT Bhilai address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },
    academicInfo: {
      studentId: {
        type: String,
        unique: true,
        sparse: true,
        match: [/^\d{9}$/, "Student ID must be 9 digits"],
      },
      department: {
        type: String,
        enum: DEPARTMENTS,
      },
      year: {
        type: String,
        enum: YEARS,
      },
      batch: {
        type: Number,
        min: 2023,
        max: new Date().getFullYear(),
      },
    },
    domainVerified: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      sparse: true,
      match: [
        /^(\+91|91)?[6-9]\d{9}$/,
        "Please enter a valid Indian phone number",
      ],
    },
    whatsapp: {
      type: String,
      match: [/^(\+91|91)?[6-9]\d{9}$/, "Please enter a valid WhatsApp number"],
    },
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
      validate: {
        validator: function (v) {
          return !v || /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif))$/i.test(v);
        },
        message: "Please provide a valid image URL",
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpires: {
      type: Date,
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
        expiresAt: { type: Date, required: true },
      },
    ],
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
      privacy: {
        showPhone: { type: Boolean, default: false },
        showEmail: { type: Boolean, default: true },
      },
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
    hostelLocation: hostelLocationSchema,
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    trustScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for display name
userSchema.virtual("displayName").get(function () {
  return this.academicInfo?.studentId
    ? `${this.name} (${this.academicInfo.studentId})`
    : this.name;
});

//for account locked status
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

//password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    new ApiError(500, "Something went wrong");
    next(err);
  }
});

//token expiry
userSchema.pre("save", function (next) {
  if (this.isModified("verificationToken") && this.verificationToken) {
    this.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  next();
});

// Methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.verificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return token;
};

userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
  return token;
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      roles: this.roles,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  });
};

userSchema.methods.addRefreshToken = function (token) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  this.refreshTokens.push({ token, expiresAt });

  // Keep only last 3 refresh tokens
  if (this.refreshTokens.length > 3) {
    this.refreshTokens = this.refreshTokens.slice(-3);
  }
};

userSchema.methods.removeRefreshToken = function (token) {
  this.refreshTokens = this.refreshTokens.filter((rt) => rt.token !== token);
};

userSchema.methods.incrementLoginAttempts = function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { loginAttempts: 1, lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

userSchema.methods.updateRating = function (newRating) {
  // Simple rating calculation
  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  this.rating.average = Math.round(this.rating.average * 10) / 10; // Round to 1 decimal
};

// Indexes
userSchema.index({ username: 1, email: 1 });
userSchema.index({ "academicInfo.studentId": 1 }, { sparse: true });
userSchema.index({ trustScore: -1 });
userSchema.index({ "refreshTokens.expiresAt": 1 }, { expireAfterSeconds: 0 });

export const User = mongoose.model("User", userSchema);
