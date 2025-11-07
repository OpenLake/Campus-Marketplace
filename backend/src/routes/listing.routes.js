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

  // Utility operations
  getCategories,
  deleteListingImage,
  getPriceHistory,
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
listingRouter.get("/categories", getCategories); // Get available categories

// Image Upload Route (before other routes to avoid conflicts)
listingRouter.post(
  "/upload-image",
  verifyJWT,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Import uploadToCloudinary and removeLocalFiles
      const { uploadToCloudinary } = await import("../utils/upload.js");
      const { removeLocalFiles } = await import("../middlewares/multer.js");

      // Upload to Cloudinary
      const result = await uploadToCloudinary(
        req.file.path,
        "campus-marketplace"
      );

      // Remove local file after upload
      removeLocalFiles([req.file]);

      return res.status(200).json({
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      });
    } catch (error) {
      console.error("Image upload error:", error);
      if (req.file) {
        const { removeLocalFiles } = await import("../middlewares/multer.js");
        removeLocalFiles([req.file]);
      }
      return res.status(500).json({
        success: false,
        message: "Failed to upload image",
        error: error.message,
      });
    }
  }
);

// PROTECTED ROUTES (Authentication Required)

// User-Specific Routes (MUST come BEFORE /:id to avoid route conflicts)
listingRouter.get("/me/listings", verifyJWT, getMyListings); // Get current user's listings
listingRouter.get("/me/dashboard", verifyJWT, getDashboardStats); // Get seller dashboard stats

// Core CRUD Operations
listingRouter.post("/", verifyJWT, upload.array("images", 10), createListing); // Create new listing

// Single Listing Operations (/:id routes - MUST come AFTER specific routes)
listingRouter.get("/user/:userId", getUserListings); // Get listings by specific user

// Price history route (MUST come BEFORE /:id to avoid route conflicts)
listingRouter.get("/:id/price-history", getPriceHistory);

// DELETE image from listing
listingRouter.delete(
  "/:id/images",
  verifyJWT,
  verifyListingOwnershipOrAdmin,
  deleteListingImage
);

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
