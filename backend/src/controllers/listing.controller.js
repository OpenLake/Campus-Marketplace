import { asyncHandler } from "../utils/asyncHandler.js";
import { Listing } from "../models/listing.model.js";
import { removeLocalFiles } from "../middlewares/multer.js";
import { uploadToCloudinary } from "../utils/upload.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { LISTING_CATEGORIES } from "../models/index.js";

const ALLOWED_ROLES = [
  "student",
  "vendor_admin",
  "club_admin",
  "admin",
  "moderator",
];

// Core CRUD Operations
export const createListing = asyncHandler(async (req, res) => {
  //1. Authorization check
  const userRoles = req.user.roles || [];
  const hasAllowedRole = ALLOWED_ROLES.some((role) => userRoles.includes(role));

  if (!hasAllowedRole) {
    removeLocalFiles(req.files);
    throw new ApiError(403, "Unauthorized to create listings");
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
    throw new ApiError(400, "Title must be at least 3 characters long");
  }

  if (!description || description.trim().length < 10) {
    removeLocalFiles(req.files);
    throw new ApiError(400, "Description must be at least 10 characters long");
  }

  if (!price || isNaN(price) || price < 0) {
    removeLocalFiles(req.files);
    throw new ApiError(400, "Price must be a valid number");
  }

  if (!category) {
    removeLocalFiles(req.files);
    throw new ApiError(400, "Category is required");
  }

  if (!condition) {
    removeLocalFiles(req.files);
    throw new ApiError(400, "Condition is required");
  }

  if (!location) {
    removeLocalFiles(req.files);
    throw new ApiError(400, "Location is required");
  }

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "At least one image is required");
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
      throw new ApiError(400, "At least one image is required.");
    }
  } catch (err) {
    removeLocalFiles(req.files);
    throw new ApiError(500, "Image upload failed.", err.message);
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

    const response = new ApiResponse(
      201,
      savedListing,
      "Listing created successfully."
    );
    return res.status(201).json(response);
  } catch (err) {
    throw new ApiError(500, "Failed to create listing.", err.message);
  }
}); // Create new listing with validation

export const getAllListings = asyncHandler(async (req, res) => {
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

  const response = new ApiResponse(
    200,
    listings,
    "Listings fetched successfully"
  );
  return res.json(response);
}); // Browse listings with pagination & filters

export const getListingById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate(
      "owner",
      "name username profileImage roles hostelLocation ratingAsSeller"
    )
    .lean();

  if (!listing) {
    return new ApiError(404, "Listing not found.");
  }

  // Optionally: increment views here
  await Listing.findByIdAndUpdate(id, { $inc: { "views.total": 1 } });

  res.json(listing);
}); // Get detailed listing information

export const updateListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Find the listing
  const listing = await Listing.findById(id);

  if (!listing) {
    removeLocalFiles(req.files);
    return res.status(404).json({ message: "Listing not found" });
  }

  // 2. Authorization check - only owner or admin/moderator can update
  const isOwner = listing.owner.toString() === req.user._id.toString();
  const userRoles = req.user.roles || [];
  const isAdminOrMod =
    userRoles.includes("admin") || userRoles.includes("moderator");

  if (!isOwner && !isAdminOrMod) {
    removeLocalFiles(req.files);
    return res
      .status(403)
      .json({ message: "Unauthorized to update this listing" });
  }

  // 3. Extract and validate update fields
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
    isAvailable,
    status,
  } = req.body;

  // Validate if provided
  if (title && title.trim().length < 3) {
    removeLocalFiles(req.files);
    return res
      .status(400)
      .json({ message: "Title must be at least 3 characters long" });
  }

  if (description && description.trim().length < 10) {
    removeLocalFiles(req.files);
    return res
      .status(400)
      .json({ message: "Description must be at least 10 characters long" });
  }

  if (price !== undefined && (isNaN(price) || price < 0)) {
    removeLocalFiles(req.files);
    return res.status(400).json({ message: "Price must be a valid number" });
  }

  // 4. Handle new images if provided
  let newImages = [];
  if (req.files && req.files.length > 0) {
    try {
      for (const [i, file] of req.files.entries()) {
        const result = await uploadToCloudinary(
          file.path,
          "campus-marketplace"
        );
        newImages.push({
          url: result.secure_url,
          publicId: result.public_id,
          isPrimary: i === 0 && listing.images.length === 0,
        });
      }
      removeLocalFiles(req.files);
    } catch (err) {
      removeLocalFiles(req.files);
      return res
        .status(500)
        .json({ error: "Image upload failed.", details: err.message });
    }
  }

  // 5. Track price history if price changed
  if (price !== undefined && price !== listing.price) {
    listing.priceHistory.push({
      price: listing.price,
      changedAt: new Date(),
      changedBy: req.user._id,
    });
  }

  // 6. Update fields
  if (title) listing.title = title;
  if (description) listing.description = description;
  if (price !== undefined) listing.price = price;
  if (originalPrice !== undefined) listing.originalPrice = originalPrice;
  if (category) listing.category = category;
  if (subcategory !== undefined) listing.subcategory = subcategory;
  if (condition) listing.condition = condition;
  if (brand !== undefined) listing.brand = brand;
  if (model !== undefined) listing.model = model;
  if (negotiable !== undefined) listing.negotiable = negotiable;
  if (isUrgent !== undefined) listing.isUrgent = isUrgent;
  if (isAvailable !== undefined) listing.isAvailable = isAvailable;
  if (location)
    listing.location =
      typeof location === "string" ? JSON.parse(location) : location;
  if (tags) listing.tags = Array.isArray(tags) ? tags : [tags];
  if (newImages.length > 0) {
    listing.images = [...listing.images, ...newImages];
  }

  // Only admin/moderator can change status
  if (status && isAdminOrMod) {
    listing.status = status;
  }

  listing.updatedAt = new Date();

  // 7. Save updated listing
  try {
    const updatedListing = await listing.save();
    return res.status(200).json({
      message: "Listing updated successfully.",
      listing: updatedListing,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to update listing.", details: err.message });
  }
}); // Update listing (owner/admin only)

export const deleteListing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { permanent } = req.query; // ?permanent=true for hard delete

  // 1. Find the listing
  const listing = await Listing.findById(id);

  if (!listing) {
    return res.status(404).json({ message: "Listing not found" });
  }

  // 2. Authorization check - only owner or admin/moderator can delete
  const isOwner = listing.owner.toString() === req.user._id.toString();
  const userRoles = req.user.roles || [];
  const isAdminOrMod =
    userRoles.includes("admin") || userRoles.includes("moderator");

  if (!isOwner && !isAdminOrMod) {
    return res
      .status(403)
      .json({ message: "Unauthorized to delete this listing" });
  }

  // 3. Check if already deleted (soft delete)
  if (listing.status === "deleted" && !permanent) {
    return res.status(400).json({ message: "Listing is already deleted" });
  }

  try {
    // 4. Permanent delete (admin only)
    if (permanent === "true" && isAdminOrMod) {
      // Optional: Delete images from cloudinary here
      // for (const image of listing.images) {
      //   await deleteFromCloudinary(image.publicId);
      // }

      await Listing.findByIdAndDelete(id);
      return res.status(200).json({
        message: "Listing permanently deleted.",
        listingId: id,
      });
    }

    // 5. Soft delete (default)
    listing.status = "deleted";
    listing.isAvailable = false;
    listing.deletedAt = new Date();
    listing.deletedBy = req.user._id;

    await listing.save();

    return res.status(200).json({
      message: "Listing deleted successfully.",
      listing: {
        id: listing._id,
        status: listing.status,
        deletedAt: listing.deletedAt,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to delete listing.", details: err.message });
  }
}); // Soft delete listing (owner/admin only)

// User-Specific Operations (MVP)
export const getUserListings = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const {
    page = 1,
    limit = 20,
    status = "active",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Build filter
  const filter = { owner: userId };
  if (status !== "all") {
    filter.status = status;
  }

  const sortObj = {};
  sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sortObj,
    populate: { path: "owner", select: "name username profileImage roles" },
  };

  try {
    const listings = await Listing.paginate(filter, options);
    return res.status(200).json({
      message: "User listings retrieved successfully.",
      data: listings,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to fetch user listings.", details: err.message });
  }
}); // Get all listings by specific user

export const getMyListings = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Build filter for current user's listings
  const filter = { owner: req.user._id };
  if (status && status !== "all") {
    filter.status = status;
  }

  const sortObj = {};
  sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sortObj,
    populate: { path: "owner", select: "name username profileImage roles" },
  };

  try {
    const listings = await Listing.paginate(filter, options);
    return res.status(200).json({
      message: "Your listings retrieved successfully.",
      data: listings,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to fetch your listings.", details: err.message });
  }
}); // Get current user's listings

export const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    // Get counts by status
    const [activeCount, soldCount, deletedCount, totalViews] =
      await Promise.all([
        Listing.countDocuments({ owner: userId, status: "active" }),
        Listing.countDocuments({ owner: userId, status: "sold" }),
        Listing.countDocuments({ owner: userId, status: "deleted" }),
        Listing.aggregate([
          { $match: { owner: userId } },
          { $group: { _id: null, totalViews: { $sum: "$views.total" } } },
        ]),
      ]);

    // Get recent listings
    const recentListings = await Listing.find({ owner: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title price status createdAt images views")
      .lean();

    // Get total revenue (from sold items)
    const revenueData = await Listing.aggregate([
      { $match: { owner: userId, status: "sold" } },
      { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
    ]);

    const stats = {
      totalListings: activeCount + soldCount + deletedCount,
      activeListings: activeCount,
      soldListings: soldCount,
      deletedListings: deletedCount,
      totalViews: totalViews[0]?.totalViews || 0,
      totalRevenue: revenueData[0]?.totalRevenue || 0,
      recentListings,
    };

    return res.status(200).json({
      message: "Dashboard stats retrieved successfully.",
      data: stats,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to fetch dashboard stats.",
      details: err.message,
    });
  }
}); // Seller dashboard statistics

export const markAsSold = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return new ApiError(404, "Listing not found");
  }

  listing.status = "sold";
  await listing.save();

  return res
    .status(200)
    .json(new ApiResponse(200, listing, "Listing marked as sold"));
});

// Get available categories
export const getCategories = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      LISTING_CATEGORIES.map((cat) => ({
        value: cat,
        label: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, " "),
      })),
      "Categories fetched successfully"
    )
  );
});

export const getPriceHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .select("priceHistory price")
    .lean();

  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  // If no price history exists, create one with current price
  const history =
    listing.priceHistory && listing.priceHistory.length > 0
      ? listing.priceHistory
      : [{ price: listing.price, changedAt: listing.createdAt || new Date() }];

  return res
    .status(200)
    .json(new ApiResponse(200, history, "Price history fetched successfully"));
});

export const deleteListingImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { imageUrl } = req.body;

  const listing = await Listing.findById(id);

  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  // Check ownership
  if (listing.seller.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You do not have permission to modify this listing"
    );
  }

  // Remove image from array
  listing.images = listing.images.filter((img) => img !== imageUrl);
  await listing.save();

  // Note: In production, also delete from Cloudinary
  // await cloudinary.uploader.destroy(publicId);

  return res
    .status(200)
    .json(new ApiResponse(200, listing, "Image deleted successfully"));
});
// Future Features (Commented out - implement as needed)

// Search & Discovery

// export const searchListings = asyncHandler(async (req, res) => {}); // Advanced search with multiple filters
// export const getPopularListings = asyncHandler(async (req, res) => {}); // Trending and popular items
// export const getSimilarListings = asyncHandler(async (req, res) => {}); // Related/similar listings
// export const getRecommendations = asyncHandler(async (req, res) => {}); // Personalized recommendations

// Engagement Features

// export const toggleLike = asyncHandler(async (req, res) => {}); // Like/unlike listing
// export const addToWatchlist = asyncHandler(async (req, res) => {}); // Add to user's watchlist
// export const removeFromWatchlist = asyncHandler(async (req, res) => {}); // Remove from watchlist
// export const incrementViews = asyncHandler(async (req, res) => {}); // Track listing views

// Status Management (Additional)

// export const toggleListingStatus = asyncHandler(async (req, res) => {}); // Activate/deactivate listing
// export const reserveListing = asyncHandler(async (req, res) => {}); // Reserve for specific buyer
// export const bumpListing = asyncHandler(async (req, res) => {}); // Refresh listing position

// Analytics & Reporting

// export const getListingAnalytics = asyncHandler(async (req, res) => {}); // Detailed listing performance
// export const getViewHistory = asyncHandler(async (req, res) => {}); // View tracking data
// export const getPriceHistory = asyncHandler(async (req, res) => {}); // Price change history
// export const generateReport = asyncHandler(async (req, res) => {}); // Admin reporting functions
