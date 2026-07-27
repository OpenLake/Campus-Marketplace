import { Router } from "express";
import { verifyJWT, optionalAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";
import {
  // Create
  createListing,
  
  // Read (Public)
  getListings,
  getListingById,
  getSellerListings,
  getCategories,
  
  // Read (Private)
  getMyListings,
  getListingStats,
  
  // Update
  updateListing,
  toggleListingActive,
  addListingImages,
  removeListingImage,
  setPrimaryImage,
  
  // Delete
  deleteListing,
  // Cloudinary Upload
  uploadImage
} from "../controllers/listing.controller.js";

const listingRouter = Router();

/* ========== PUBLIC ROUTES (NO AUTH) ========== */
listingRouter.get("/categories", getCategories);              // GET /api/listings/categories
listingRouter.get("/seller/:sellerId", getSellerListings);    // GET /api/listings/seller/:sellerId
listingRouter.get("/", getListings);                          // GET /api/listings

/* ========== PROTECTED ROUTES (REQUIRE AUTH) ========== */
// Create
listingRouter.post("/", verifyJWT, createListing);                       // POST /api/listings
listingRouter.post("/upload-image", verifyJWT, upload.single("image"), uploadImage); // POST /api/listings/upload-image

// Read (Private)
listingRouter.get("/my-listings", verifyJWT, getMyListings);            // GET /api/listings/my-listings
listingRouter.get("/stats", verifyJWT, getListingStats);                 // GET /api/listings/stats

// Update - Parameter routes
listingRouter.put("/:id", verifyJWT, updateListing);                     // PUT /api/listings/:id
listingRouter.patch("/:id/toggle-active", verifyJWT, toggleListingActive); // PATCH /api/listings/:id/toggle-active

// Image management
listingRouter.post("/:id/images", verifyJWT, addListingImages);          // POST /api/listings/:id/images
listingRouter.delete("/:id/images/:imageId", verifyJWT, removeListingImage); // DELETE /api/listings/:id/images/:imageId
listingRouter.patch("/:id/images/:imageId/primary", verifyJWT, setPrimaryImage); // PATCH /api/listings/:id/images/:imageId/primary

// Delete
listingRouter.delete("/:id", verifyJWT, deleteListing);                  // DELETE /api/listings/:id

/* ========== PUBLIC PARAMETER ROUTE (MUST BE LAST) ========== */
// Use optionalAuth so that authenticated user's requests are parsed without forcing login
listingRouter.get("/:id", optionalAuth, getListingById);                    // GET /api/listings/:id

export default listingRouter;