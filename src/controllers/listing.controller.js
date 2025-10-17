import { asyncHandler } from "../utils/asyncHandler.js";
import Listing from "../models/listing.model.js";
import { removeLocalFiles } from "../middlewares/multer.js";
import { uploadToCloudinary } from "../utils/upload.js";

const ALLOWED_ROLES = [
  "student",
  "vendor_admin",
  "club_admin",
  "admin",
  "moderator",
];

// Core CRUD Operations
export const createListing = (asyncHandler = async (req, res) => {
  //1. Authorization check
  if (!ALLOWED_ROLES.includes(req.user.role)) {
    removeLocalFiles(req.files);
    return res.status(403).json({ message: "Unauthorized to create listings" });
  }
  //2. Validate required fields
  const {
    title,
    description,
    price,
    category,
    condition,
    location,
    negotiable,
    tags,
    brand,
    model,
    isUrgent,
    originalPrice,
    subcategory,
  } = req.body;

  if (!title || title.trim().length < 3) {
    removeLocalFiles(req.files);
    return res
      .status(400)
      .json({ message: "Title must be at least 3 characters long" });
  }

  if (!description || description.trim().length < 10) {
    removeLocalFiles(req.files);
    return res
      .status(400)
      .json({ message: "Description must be at least 10 characters long" });
  }

  if (!price || isNaN(price) || price < 0) {
    removeLocalFiles(req.files);
    return res.status(400).json({ message: "Price must be a valid number" });
  }

  if (!category) {
    removeLocalFiles(req.files);
    return res.status(400).json({ message: "Category is required" });
  }

  if (!condition) {
    removeLocalFiles(req.files);
    return res.status(400).json({ message: "Condition is required" });
  }

  if (!location) {
    removeLocalFiles(req.files);
    return res.status(400).json({ message: "Location is required" });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "At least one image is required" });
  }
  //3. Handle images: upload to Cloudinary
  let images = [];
  try {
    if (req.files && req.files.length > 0) {
      for (const [i, file] of req.files.entries()) {
        const result = await uploadToCloudinary(
          file.path,
          "campus-marketplace"
        );
        images.push({
          url: result.secure_url,
          publicId: result.public_id,
          isPrimary: i === 0, // first image is primary
        });
      }
      removeLocalFiles(req.files);
    } else {
      return res.status(400).json({ error: "At least one image is required." });
    }
  } catch (err) {
    removeLocalFiles(req.files);
    return res
      .status(500)
      .json({ error: "Image upload failed.", details: err.message });
  }
  // 4. Create listing document
  const listing = new Listing({
    title,
    description,
    price,
    originalPrice: originalPrice || undefined,
    category,
    subcategory: subcategory || undefined,
    condition,
    brand: brand || undefined,
    model: model || undefined,
    negotiable: negotiable !== undefined ? negotiable : true,
    isUrgent: isUrgent || false,
    location: typeof location === "string" ? JSON.parse(location) : location,
    tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
    images,
    owner: req.user._id,
    status: "active",
  });
  // 5. Save to DB
  try {
    const savedListing = await listing.save();
    return res.status(201).json({
      message: "Listing created successfully.",
      listing: savedListing,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to create listing.", details: err.message });
  }
}); // Create new listing with validation

export const getAllListings = (asyncHandler = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    condition,
    minPrice,
    maxPrice,
    hostel,
    sortBy = "createdAt",
    sortOrder = "desc",
    search,
  } = req.query;

  const filter = { status: "active", isAvailable: true };
  if (category) filter.category = category;
  if (condition) filter.condition = condition;
  if (hostel) filter["location.hostel"] = hostel;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (search) {
    filter.$text = { $search: search };
  }

  const sortObj = {};
  sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sortObj,
    populate: { path: "owner", select: "name username profileImage roles" },
  };

  const listings = await Listing.paginate(filter, options);

  res.json(listings);
}); // Browse listings with pagination & filters

export const getListingById = (asyncHandler = async (req, res) => {
    const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate("owner", "name username profileImage roles hostelLocation ratingAsSeller")
    .lean();

  if (!listing) {
    return res.status(404).json({ error: "Listing not found." });
  }

  // Optionally: increment views here
  await Listing.findByIdAndUpdate(id, { $inc: { "views.total": 1 } });

  res.json(listing);
}); // Get detailed listing information

export const updateListing = (asyncHandler = (req, res) => {}); // Update listing (owner/admin only)
export const deleteListing = (asyncHandler = (req, res) => {}); // Soft delete listing (owner/admin only)

// User-Specific Operations
export const getUserListings = (asyncHandler = (req, res) => {}); // Get all listings by specific user
export const getMyListings = (asyncHandler = (req, res) => {}); // Get current user's listings
export const getDashboardStats = (asyncHandler = (req, res) => {}); // Seller dashboard statistics

// Search & Discovery
export const searchListings = (asyncHandler = (req, res) => {}); // Advanced search with multiple filters
export const getPopularListings = (asyncHandler = (req, res) => {}); // Trending and popular items
export const getSimilarListings = (asyncHandler = (req, res) => {}); // Related/similar listings
export const getRecommendations = (asyncHandler = (req, res) => {}); // Personalized recommendations

// Engagement Features
export const toggleLike = (asyncHandler = (req, res) => {}); // Like/unlike listing
export const addToWatchlist = (asyncHandler = (req, res) => {}); // Add to user's watchlist
export const removeFromWatchlist = (asyncHandler = (req, res) => {}); // Remove from watchlist
export const incrementViews = (asyncHandler = (req, res) => {}); // Track listing views

// Status Management
export const toggleListingStatus = (asyncHandler = (req, res) => {}); // Activate/deactivate listing
export const markAsSold = (asyncHandler = (req, res) => {}); // Mark listing as sold
export const reserveListing = (asyncHandler = (req, res) => {}); // Reserve for specific buyer
export const bumpListing = (asyncHandler = (req, res) => {}); // Refresh listing position

// Analytics & Reporting
export const getListingAnalytics = (asyncHandler = (req, res) => {}); // Detailed listing performance
export const getViewHistory = (asyncHandler = (req, res) => {}); // View tracking data
export const getPriceHistory = (asyncHandler = (req, res) => {}); // Price change history
export const generateReport = (asyncHandler = (req, res) => {}); // Admin reporting functions

// Utility Functions
export const validateListingData = (asyncHandler = (req, res) => {}); // Input validation helper
export const processImages = (asyncHandler = (req, res) => {}); // Image upload/processing
export const updatePriceHistory = (asyncHandler = (req, res) => {}); // Track price changes
export const checkOwnership = (asyncHandler = (req, res) => {}); // Verify listing ownership
export const sendNotifications = (asyncHandler = (req, res) => {}); // Notify watchers of updates
