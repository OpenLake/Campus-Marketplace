import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/users.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/asyncHandler.js";
// import { comparePassword } from "../models/users.model.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        username: user.username,
        roles: user.roles,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
    );
    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
    );

    //adding to db
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
    });

    //keeping only 3 refresh tokens
    if (user.refreshTokens.length > 3) {
      user.refreshTokens = user.refreshTokens.slice(-3);
    }

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

// Register controller function
const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password, phone, whatsapp, hostelLocation } =
    req.body;

  if (!name || !username || !email || !password) {
    throw new ApiError(400, "Name, username, email and password are required");
  }

  // Check if user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Enforce IIT Bhilai domain
  if (!email.endsWith("@iitbhilai.ac.in")) {
    throw new ApiError(400, "Only @iitbhilai.ac.in emails are allowed to register.");
  }

  // Create user
  const user = await User.create({
    name,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    phone,
    whatsapp,
    hostelLocation,
  });

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  console.log("Verification Token:", verificationToken);
  //Verification Token: 2392f256ca845391d61fa19f038d0bc59c8a4565f6682b4bec0a5a48f4142dfe

  user.verificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  await user.save({ validateBeforeSave: false });

  const createdUser = await User.findById(user._id).select(
    "-password -verificationToken -resetPasswordToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  console.log("User registered successfully:", createdUser);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdUser,
        "User registered successfully. Please verify your email."
      )
    );
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!((username || email) && password)) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  }).select("+password");

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshTokens -verificationToken -resetPasswordToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies || req.body;

  if (refreshToken) {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: {
          refreshTokens: { token: refreshToken },
        },
      },
      { new: true }
    );
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Verify Email
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ApiError(400, "Verification token is required");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    verificationToken: hashedToken,
  }).select("+verificationToken");

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token");
  }

  user.isVerified = true;
  user.domainVerified = user.email.endsWith("@iitbhilai.ac.in");
  user.verificationToken = undefined;
  await user.save({ validateBeforeSave: false });

  return (
    res
      .status(200)
      .json(new ApiResponse(200, {}, "Email verified successfully")),
    user
  );
});

// Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User with this email does not exist");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);

  await user.save({ validateBeforeSave: false });

  // TODO: Send email with reset token
  // For now, we'll just return the token (remove this in production)
  return res
    .status(200)
    .json(
      new ApiResponse(200, { resetToken }, "Password reset token sent to email")
    );
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new ApiError(400, "Token and new password are required");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+resetPasswordToken");

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.refreshTokens = []; // Invalidate all refresh tokens

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});

// Change Password
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }

  const user = await User.findById(req.user._id).select("+password");

  const isPasswordCorrect = await user.comparePassword(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  user.refreshTokens = []; // Invalidate all refresh tokens
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

// Update User Profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, phone, whatsapp, profileImage, preferences, hostelLocation } =
    req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        name,
        phone,
        whatsapp,
        profileImage,
        preferences,
        hostelLocation,
      },
    },
    { new: true }
  ).select("-password -refreshTokens -verificationToken -resetPasswordToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

// Get User By ID (Public Profile)
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select(
    "name username email profileImage hostelLocation ratingAsSeller ratingAsBuyer isVerified createdAt"
  );

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully"));
});

// List Users (Admin)
const listUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (role) {
    query.roles = role;
  }

  const users = await User.find(query)
    .select("-password -refreshTokens -verificationToken -resetPasswordToken")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, users, "Users fetched successfully", {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    })
  );
});

// Delete User (Admin)
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  await User.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

// Update User Roles (Admin)
const updateUserRoles = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { roles } = req.body;

  if (!roles || !Array.isArray(roles)) {
    throw new ApiError(400, "Valid roles array is required");
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: { roles } },
    { new: true }
  ).select("-password -refreshTokens -verificationToken -resetPasswordToken");

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User roles updated successfully"));
});

// Get Wishlist
// const getWishlist = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   const user = await User.findById(id).populate(
//     "wishlist",
//     "title price images status owner"
//   );

//   if (!user) {
//     throw new ApiError(404, "User does not exist");
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, user.wishlist, "Wishlist fetched successfully"));
// });

// // Add to Wishlist
// const addToWishlist = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { listingId } = req.body;

//   if (!listingId) {
//     throw new ApiError(400, "Listing ID is required");
//   }

//   const user = await User.findById(id);

//   if (!user) {
//     throw new ApiError(404, "User does not exist");
//   }

//   if (user.wishlist.includes(listingId)) {
//     throw new ApiError(400, "Listing already in wishlist");
//   }

//   user.wishlist.push(listingId);
//   await user.save();

//   return res
//     .status(200)
//     .json(new ApiResponse(200, {}, "Added to wishlist successfully"));
// });

// // Remove from Wishlist
// const removeFromWishlist = asyncHandler(async (req, res) => {
//   const { id, listingId } = req.params;

//   const user = await User.findById(id);

//   if (!user) {
//     throw new ApiError(404, "User does not exist");
//   }

//   user.wishlist = user.wishlist.filter((item) => item.toString() !== listingId);
//   await user.save();

//   return res
//     .status(200)
//     .json(new ApiResponse(200, {}, "Removed from wishlist successfully"));
// });

export {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  getCurrentUser,
  updateUserProfile,
  getUserById,
  listUsers,
  deleteUser,
  updateUserRoles,
  // getWishlist,
  // addToWishlist,
  // removeFromWishlist,
};
