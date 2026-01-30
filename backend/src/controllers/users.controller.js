import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/users.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * UTILITY: Generate security tokens with persistence
 */
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = jwt.sign(
      { _id: user._id, email: user.email, username: user.username, roles: user.roles },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
    );
    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
    );

    // Save the new refresh token to DB
    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    
    // Maintain a limit of 3 active sessions
    if (user.refreshTokens.length > 3) {
      user.refreshTokens = user.refreshTokens.slice(-3);
    }

    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating security tokens");
  }
};

/**
 * 1. REGISTER: Domain enforcement and enumeration protection
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password, phone, whatsapp, hostelLocation } = req.body;

  if (!name || !username || !email || !password) {
    throw new ApiError(400, "All required fields must be provided");
  }

  // FIX: Validate domain FIRST to prevent user existence probing
  if (!email.toLowerCase().endsWith("@iitbhilai.ac.in")) {
    throw new ApiError(400, "Registration is restricted to official @iitbhilai.ac.in emails.");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "A user with this username or email already exists.");
  }

  const user = await User.create({
    name,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    phone,
    whatsapp,
    hostelLocation,
  });

  const verificationToken = crypto.randomBytes(32).toString("hex");
  user.verificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
  await user.save({ validateBeforeSave: false });

  const createdUser = await User.findById(user._id).select("-password -verificationToken -resetPasswordToken");

  return res.status(201).json(new ApiResponse(201, createdUser, "Account created. Please verify your email."));
});

/**
 * 2. LOGIN: Secure session start
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!((username || email) && password)) {
    throw new ApiError(400, "Username/Email and password are required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid user credentials. Please check your password.");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshTokens -verificationToken -resetPasswordToken");

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "Login successful"));
});


// 2. REFRESH TOKEN: Hardened with optional chaining to prevent crashes
const refreshAccessToken = asyncHandler(async (req, res) => {
  // Use optional chaining req.cookies?.refreshToken to prevent "undefined" error
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "No refresh token provided");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);

    if (!user) throw new ApiError(401, "Invalid refresh token");

    const isValidToken = user.refreshTokens.some((t) => t.token === incomingRefreshToken);
    if (!isValidToken) {
      user.refreshTokens = []; // Clear sessions on suspected reuse
      await user.save({ validateBeforeSave: false });
      throw new ApiError(401, "Refresh token is expired or used");
    }

    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== incomingRefreshToken);
    await user.save({ validateBeforeSave: false });

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

    const options = { httpOnly: true, secure: true };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Token refreshed"));

  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, "Invalid refresh token session");
  }
});

// 4. LOGOUT: Also updated with defensive checks
const logoutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (refreshToken) {
    await User.findByIdAndUpdate(req.user?._id, {
      $pull: { refreshTokens: { token: refreshToken } }
    });
  }

  const options = { httpOnly: true, secure: true };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});




/**
 * 5. EMAIL VERIFICATION
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) throw new ApiError(400, "Token is required");

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({ verificationToken: hashedToken });

  if (!user) throw new ApiError(400, "Invalid or expired token");

  user.isVerified = true;
  user.domainVerified = true;
  user.verificationToken = undefined;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, "Email verified successfully"));
});

/**
 * 6. PASSWORD MANAGEMENT
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new ApiError(404, "User not found");

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpires = Date.now() + 600000; // 10 mins
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, { resetToken }, "Reset link generated"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({ 
    resetPasswordToken: hashedToken, 
    resetPasswordExpires: { $gt: Date.now() } 
  });

  if (!user) throw new ApiError(400, "Invalid or expired reset token");

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.refreshTokens = []; // Logout all devices
  await user.save();

  return res.status(200).json(new ApiResponse(200, {}, "Password reset success"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(oldPassword))) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  user.refreshTokens = [];
  await user.save();

  return res.status(200).json(new ApiResponse(200, {}, "Password changed"));
});

/**
 * 7. PROFILE & ADMIN OPS
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched"));
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, { $set: req.body }, { new: true }).select("-password");
  return res.status(200).json(new ApiResponse(200, user, "Profile updated"));
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("name username profileImage hostelLocation ratingAsSeller isVerified");
  if (!user) throw new ApiError(404, "User not found");
  return res.status(200).json(new ApiResponse(200, user, "User fetched"));
});

const listUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const query = search ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] } : {};
  
  const users = await User.find(query).limit(limit * 1).skip((page - 1) * limit).select("-password");
  return res.status(200).json(new ApiResponse(200, users, "List fetched"));
});

const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  return res.status(200).json(new ApiResponse(200, {}, "User deleted"));
});

const updateUserRoles = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { $set: { roles: req.body.roles } }, { new: true });
  return res.status(200).json(new ApiResponse(200, user, "Roles updated"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  getCurrentUser,
  updateUserProfile,
  getUserById,
  listUsers,
  deleteUser,
  updateUserRoles
};