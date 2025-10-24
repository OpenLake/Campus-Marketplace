import { Router } from "express";
import {
  // Core CRUD operations (MVP)
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,

  // User-specific operations (MVP)
  getUserListings,
  getMyListings,
  getDashboardStats,
  markAsSold,
} from "../controllers/listing.controller.js";

import {
  verifyJWT,
  optionalAuth,
  verifyListingOwnershipOrAdmin,
} from "../middlewares/auth.middleware.js";

import { upload } from "../middlewares/multer.js";

const listingRouter = Router();

// PUBLIC ROUTES (No Authentication Required)
listingRouter.get("/", getAllListings); // Browse all listings

// PROTECTED ROUTES (Authentication Required)

// User-Specific Routes (MUST come BEFORE /:id to avoid route conflicts)
listingRouter.get("/me/listings", verifyJWT, getMyListings); // Get current user's listings
listingRouter.get("/me/dashboard", verifyJWT, getDashboardStats); // Get seller dashboard stats

// Core CRUD Operations
listingRouter.post("/", verifyJWT, upload.array("images", 10), createListing); // Create new listing

// Single Listing Operations (/:id routes - MUST come AFTER specific routes)
listingRouter.get("/user/:userId", getUserListings); // Get listings by specific user
listingRouter.get("/:id", optionalAuth, getListingById); // View single listing (optional auth for tracking)
listingRouter.put(
  "/:id",
  verifyJWT,
  verifyListingOwnershipOrAdmin,
  upload.array("images", 10),
  updateListing
); // Update listing (owner or admin only)
listingRouter.delete(
  "/:id",
  verifyJWT,
  verifyListingOwnershipOrAdmin,
  deleteListing
); // Delete listing (owner or admin only)

// Status Management
listingRouter.patch(
  "/:id/mark-sold",
  verifyJWT,
  verifyListingOwnershipOrAdmin,
  markAsSold
); // Mark listing as sold (owner or admin only)

export default listingRouter;
