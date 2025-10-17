import { Router } from "express";
import {
  //core CRUD operations
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,

  //user-specific operations
  getUserListings,
  getMyListings,
  getDashboardStats,
  getListingAnalytics,
  //search & discovery
  searchListings,
  getPopularListings,
  getSimilarListings,
  getRecommendations,

  //engagement features
  toggleLike,
  addToWatchlist,
  removeFromWatchlist,
  incrementViews,

  //status management
  toggleListingStatus,
  markAsSold,
  reserveListing,
  bumpListing,

  //analytics & reporting
  getListingAnalytics,
  getViewHistory,
  getPriceHistory,
  generateReport,

  //Admin functions
} from "../controllers/listing.controller.js";

import {
  verifyJWT,
  checkRole,
  optionalAuth,
  checkOwnership,
  checkOwnershipOrRole,
} from "../middleware/auth.middleware.js";

import { upload } from "../middlewares/multer.js";

// Core CRUD Operations

const listingRouter = Router();

//public routes
listingRouter.get("/", getAllListings);
listingRouter.get("/popular", getPopularListings);
listingRouter.get("/search", searchListings);
listingRouter.get("/:id", optionalAuth, getListingById);
listingRouter.get("/:id/similar", getSimilarListings);

//protected routes
listingRouter.use(verifyJWT);

listingRouter.post("/", upload.array("images", 10), createListing);
listingRouter.put(
  "/:id",
  upload.array("images", 10),
  checkOwnershipOrRole(["admin", "moderator"]),
  updateListing
);
listingRouter.delete(
  "/:id",
  checkOwnershipOrRole(["admin", "moderator"]),
  deleteListing
);

//user-specific routes
listingRouter.get("/user/:userId", getUserListings);
listingRouter.get("/me/listings", getMyListings);
listingRouter.get("/me/dashboard", getDashboardStats);
listingRouter.get("/:id/recommendations", getRecommendations);

//engagement routes
listingRouter.post("/:id/like", toggleLike);
listingRouter.post("/:id/watchlist", addToWatchlist);
listingRouter.delete("/:id/watchlist", removeFromWatchlist);
listingRouter.post("/:id/views", incrementViews);

//status management routes
listingRouter.patch(
  "/:id/toggle-status",
  checkOwnershipOrRole(["admin", "moderator"]),
  toggleListingStatus
);
listingRouter.patch("/:id/mark-sold", checkOwnership, markAsSold);
listingRouter.patch("/:id/reserve", checkOwnership, reserveListing);
listingRouter.patch("/:id/bump", checkOwnership, bumpListing);

//analytics & reporting routes
listingRouter.get(
  "/:id/analytics",
  checkOwnershipOrRole(["admin", "moderator"]),
  getListingAnalytics
);
listingRouter.get(
  "/:id/view-history",
  checkOwnershipOrRole(["admin", "moderator"]),
  getViewHistory
);
listingRouter.get("/:id/price-history", getPriceHistory);

//Admin/moderator reporting routes
listingRouter.use(checkRole(["admin", "moderator"]));
listingRouter.get("/admin/featured", getPopularListings); // Or getFeaturedListings if available
listingRouter.get("/admin/reported", generateReport); // Or getReportedListings if available
listingRouter.patch("/:id/feature", toggleListingStatus); // Or toggleFeatureStatus if available
listingRouter.patch("/:id/ban", markAsSold); // Or banListing if available

export default listingRouter;
