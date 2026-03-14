import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
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
  deleteListing
} from "../controllers/listing.controller.js";

const listingRouter = Router();

/* ========== PUBLIC ROUTES (NO AUTH) ========== */
// These must come BEFORE parameter routes
listingRouter.get("/categories", getCategories);              // GET /api/listings/categories
listingRouter.get("/seller/:sellerId", getSellerListings);    // GET /api/listings/seller/:sellerId
listingRouter.get("/", getListings);                          // GET /api/listings

/* ========== PROTECTED ROUTES (REQUIRE AUTH) ========== */
// Apply auth middleware to all routes below
listingRouter.use(verifyJWT);

// Create
listingRouter.post("/", createListing);                       // POST /api/listings

// Read (Private) - THESE MUST COME BEFORE PARAMETER ROUTES
listingRouter.get("/my-listings", getMyListings);            // GET /api/listings/my-listings
listingRouter.get("/stats", getListingStats);                 // GET /api/listings/stats

// Update - Parameter routes
listingRouter.put("/:id", updateListing);                     // PUT /api/listings/:id
listingRouter.patch("/:id/toggle-active", toggleListingActive); // PATCH /api/listings/:id/toggle-active

// Image management
listingRouter.post("/:id/images", addListingImages);          // POST /api/listings/:id/images
listingRouter.delete("/:id/images/:imageId", removeListingImage); // DELETE /api/listings/:id/images/:imageId
listingRouter.patch("/:id/images/:imageId/primary", setPrimaryImage); // PATCH /api/listings/:id/images/:imageId/primary

// Delete
listingRouter.delete("/:id", deleteListing);                  // DELETE /api/listings/:id

/* ========== PUBLIC PARAMETER ROUTE (MUST BE LAST) ========== */
// This must be LAST to avoid catching other routes
listingRouter.get("/:id", getListingById);                    // GET /api/listings/:id

export default listingRouter;