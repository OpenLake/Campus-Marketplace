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
} from "../controllers/users.controller.js";
import {
  verifyJWT,
  verifyAdmin,
  verifyOwnershipOrAdmin,
} from "../middlewares/auth.middleware.js";

const userRouter = Router();

// Public routes
userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/verify-email").post(verifyEmail);
userRouter.route("/forgot-password").post(forgotPassword);
userRouter.route("/reset-password").post(resetPassword);

// Protected routes (require authentication) - Place these BEFORE dynamic routes
userRouter.route("/logout").post(verifyJWT, logoutUser);
userRouter.route("/me").get(verifyJWT, getCurrentUser);
userRouter.route("/me").put(verifyJWT, updateUserProfile);
userRouter.route("/me/password").put(verifyJWT, changePassword);

// Public profile route - Place dynamic routes AFTER specific routes
userRouter.route("/:id").get(getUserById);

// Admin only routes
userRouter.route("/").get(verifyJWT, verifyAdmin, listUsers);
userRouter.route("/:id").delete(verifyJWT, verifyAdmin, deleteUser);
userRouter.route("/:id/roles").patch(verifyJWT, verifyAdmin, updateUserRoles);

export default userRouter;
