import { Router } from "express";
import {
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
  refreshAccessToken
} from "../controllers/users.controller.js";
import {
  verifyJWT,
  verifyAdmin,
  verifyOwnershipOrAdmin,
} from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/verify-email", verifyEmail);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/refresh-token", refreshAccessToken);


// Current User Routes (MUST come BEFORE /:id to avoid route conflicts)
userRouter.get("/me", verifyJWT, getCurrentUser);
userRouter.put("/me", verifyJWT, updateUserProfile);
userRouter.put("/me/password", verifyJWT, changePassword);
userRouter.post("/logout", verifyJWT, logoutUser);

// Admin Only Routes (MUST come BEFORE public /:id route)
userRouter.get("/", verifyJWT, verifyAdmin, listUsers); // List all users
userRouter.delete("/:id", verifyJWT, verifyAdmin, deleteUser); // Delete user by ID
userRouter.patch("/:id/roles", verifyJWT, verifyAdmin, updateUserRoles); // Update user roles

// Public User Profile Route (/:id - MUST come LAST)
userRouter.get("/:id", getUserById); // Get user profile by ID (public)

export default userRouter;
