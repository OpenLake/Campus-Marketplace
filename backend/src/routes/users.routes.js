import { Router } from "express";
import { googleSignIn, completeGoogleSignup } from '../controllers/googleAuth.controller.js';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  getCurrentUser,
  logoutUser,
  updateUserProfile,
  listUsers,
  deleteUser,
  

} from "../controllers/users.controller.js";
import { verifyJWT, verifyAdmin, verifyOwnershipOrAdmin } from "../middlewares/auth.middleware.js";

const userRouter = Router();

// Public routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/refresh-token", refreshAccessToken);
userRouter.post("/google", googleSignIn);
userRouter.post("/complete-google-signup", completeGoogleSignup);

// Protected routes
userRouter.get("/me", verifyJWT, getCurrentUser);
userRouter.post("/logout", verifyJWT, logoutUser);
userRouter.put("/me", verifyJWT, updateUserProfile);
// userRouter.put("/me/password", verifyJWT, changePassword); // implement if needed

// Admin routes
userRouter.get("/", verifyJWT, verifyAdmin, listUsers);
userRouter.delete("/:id", verifyJWT, verifyAdmin, deleteUser);
// userRouter.patch("/:id/roles", verifyJWT, verifyAdmin, updateUserRoles);

// Public profile
// userRouter.get("/:id", getUserById);

export default userRouter;