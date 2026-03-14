import { STListing } from "../models/st_listing.model.js";
import { STCategory } from "../models/st_category.model.js";
import { STInterest } from "../models/st_interest.model.js";
import { findUserById } from "../models/users.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// Helper to get user ID 
const getUserId = (req) => {
  return req.user?._id || req.user?.user_id || req.user?.id;
};

/* ========== CREATE LISTING ========== */
// In your backend controller (where createListing is)
export const createListing = asyncHandler(async (req, res) => {
  console.log("\n=== CREATE LISTING ===");
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  
  const {
    title,
    description,
    basePrice,
    price, // Allow both for testing
    condition,
    category,
    images,
    location
  } = req.body;

  const sellerId = getUserId(req);
  if (!sellerId) {
    throw new ApiError(401, "User ID not found");
  }

  // Use basePrice or price
  const finalPrice = basePrice || price;

  // Validate required fields
  if (!title || !description || !finalPrice || !condition || !category) {
    throw new ApiError(400, `Missing required fields: ${JSON.stringify({
      title: !!title,
      description: !!description, 
      price: !!finalPrice,
      condition: !!condition,
      category: !!category
    })}`);
  }

  // Validate category exists
  const categoryExists = await STCategory.findById(category);
  if (!categoryExists) {
    throw new ApiError(400, "Invalid category");
  }

  // TEMP FIX: Accept blob URLs and generate fake publicIds
  if (!images || images.length === 0) {
    throw new ApiError(400, "At least one image is required");
  }

  // Process images - accept blob URLs temporarily
  const processedImages = images.map((img, idx) => {
    // If it's a blob URL or any URL, accept it
    if (img.url) {
      return {
        url: img.url,
        // Generate a temporary publicId if missing
        publicId: img.publicId || `temp_${Date.now()}_${idx}`,
        isCover: idx === 0
      };
    }
    // If it's a string URL, convert to object
    if (typeof img === 'string') {
      return {
        url: img,
        publicId: `temp_${Date.now()}_${idx}`,
        isCover: idx === 0
      };
    }
    throw new ApiError(400, "Invalid image format");
  });

  console.log("Processed images:", processedImages);

  // Create listing
  const listingData = {
    sellerId,
    title: title.trim(),
    description: description.trim(),
    basePrice: Number(finalPrice),
    condition,
    category,
    images: processedImages,
    status: "active",
    location: location || {} // Add location if your model has it
  };

  const listing = await STListing.create(listingData);
  
  // Populate category for response
  await listing.populate("category");

  console.log("Listing created:", listing._id);

  res.status(201).json(
    new ApiResponse(201, listing, "Listing created successfully")
  );
});

/* ========== READ LISTINGS ========== */
export const getListings = asyncHandler(async (req, res) => {
  const {
    category,
    minPrice,
    maxPrice,
    condition,
    sellerId,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 20
  } = req.query;

  // Base filter: only active listings
  const filter = { status: "active" };

  if (category) filter.category = category;
  if (condition) filter.condition = condition;
  if (sellerId) filter.sellerId = sellerId;

  // Price range
  if (minPrice || maxPrice) {
    filter.basePrice = {};
    if (minPrice) filter.basePrice.$gte = Number(minPrice);
    if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
  }

  // Text search
  if (search) {
    filter.$text = { $search: search };
  }

  // Sorting
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);

  const listings = await STListing.find(filter)
    .populate("category", "name slug")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const total = await STListing.countDocuments(filter);

  // Fetch seller details from PostgreSQL for each listing
  const listingsWithSellers = await Promise.all(
    listings.map(async (listing) => {
      try {
        const seller = await findUserById(listing.sellerId);
        return {
          ...listing,
          seller: seller ? {
            user_id: seller.user_id,
            first_name: seller.first_name,
            
            last_name: seller.last_name,
            email: seller.email,           
            phone_number: seller.phone_number, 

            avatar: seller.avatar,
            rating: seller.average_rating || 0
          } : null
        };
      } catch (error) {
        return { ...listing, seller: null };
      }
    })
  );

  res.json(
    new ApiResponse(200, {
      listings: listingsWithSellers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, "Listings fetched successfully")
  );
});

export const getListingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid listing ID");
  }

  const listing = await STListing.findById(id)
    .populate("category", "name slug")
    .lean();

  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  // Get seller details from PostgreSQL
  const seller = await findUserById(listing.sellerId);

  // Check if current user has pending interest (if authenticated)
  let userInterest = null;
  if (req.user) {
    const userId = getUserId(req);
    const interest = await STInterest.findOne({
      listingId: id,
      buyerId: userId,
      status: "pending"
    });
    if (interest) {
      userInterest = {
        _id: interest._id,
        offeredPrice: interest.offeredPrice,
        status: interest.status
      };
    }
  }

  // Similar listings (same category, similar price)
  const similarListings = await STListing.find({
    _id: { $ne: id },
    category: listing.category,
    status: "active",
    basePrice: { 
      $gte: listing.basePrice * 0.5, 
      $lte: listing.basePrice * 1.5 
    }
  })
    .limit(4)
    .populate("category", "name")
    .lean();

  res.json(
    new ApiResponse(200, {
      ...listing,
      seller: seller ? {
        user_id: seller.user_id,
        first_name: seller.first_name,
        last_name: seller.last_name,
        avatar: seller.avatar,
        joined_date: seller.created_at,
        rating: seller.average_rating || 0,
        email: seller.email,           // ✅ ADD THIS
        phone_number: seller.phone_number // ✅ ADD THIS
      } : null,
      userInterest,
      similarListings,
      interestCount: listing.interestCount,
      highestOffer: listing.highestOffer
    }, "Listing fetched successfully")
  );
});

export const getSellerListings = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const { page = 1, limit = 10, status = "active" } = req.query;

  const filter = { sellerId };
  if (status !== "all") filter.status = status;

  const listings = await STListing.find(filter)
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  const total = await STListing.countDocuments(filter);

  // Get seller details
  const seller = await findUserById(sellerId);

  res.json(
    new ApiResponse(200, {
      listings,
      seller: seller ? {
        first_name: seller.first_name,
        last_name: seller.last_name,
        avatar: seller.avatar
      } : null,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, "Seller listings fetched successfully")
  );
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await STCategory.aggregate([
    { $match: { isActive: true } },
    { $lookup: {
      from: "st_listings",
      localField: "_id",
      foreignField: "category",
      as: "listings"
    }},
    { $addFields: {
      count: { $size: "$listings" },
      avgPrice: { $avg: "$listings.basePrice" }
    }},
    { $project: { listings: 0 } },
    { $sort: { count: -1 } }
  ]);

  res.json(
    new ApiResponse(200, categories, "Categories fetched successfully")
  );
});

export const getMyListings = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { page = 1, limit = 10, status = "active" } = req.query;

  const filter = { sellerId: userId };
  if (status !== "all") filter.status = status;

  const listings = await STListing.find(filter)
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  const total = await STListing.countDocuments(filter);

  res.json(
    new ApiResponse(200, {
      listings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, "My listings fetched successfully")
  );
});

/* ========== UPDATE LISTINGS ========== */
export const updateListing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const userId = getUserId(req);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid listing ID");
  }

  const listing = await STListing.findById(id);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  if (listing.sellerId !== userId) {
    throw new ApiError(403, "You can only update your own listings");
  }

  // Prevent updating certain fields
  delete updates.sellerId;
  delete updates.interestCount;
  delete updates.highestOffer;
  delete updates.status; // status should be changed via toggle/sold endpoints

  // If category is being updated, validate it
  if (updates.category) {
    const categoryExists = await STCategory.findById(updates.category);
    if (!categoryExists) {
      throw new ApiError(400, "Invalid category");
    }
  }

  const updatedListing = await STListing.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate("category");

  res.json(
    new ApiResponse(200, updatedListing, "Listing updated successfully")
  );
});

export const toggleListingActive = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = getUserId(req);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid listing ID");
  }

  const listing = await STListing.findById(id);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  if (listing.sellerId !== userId) {
    throw new ApiError(403, "Unauthorized");
  }

  // Can only toggle if not sold
  if (listing.status === "sold") {
    throw new ApiError(400, "Cannot toggle a sold item");
  }

  listing.status = listing.status === "active" ? "archived" : "active";
  await listing.save();

  res.json(
    new ApiResponse(200, listing, `Listing ${listing.status === "active" ? "activated" : "archived"} successfully`)
  );
});

// Image management functions (similar to before, but using STListing)
export const addListingImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { images } = req.body;
  const userId = getUserId(req);

  if (!images || !Array.isArray(images) || images.length === 0) {
    throw new ApiError(400, "Images array is required");
  }

  const listing = await STListing.findById(id);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  if (listing.sellerId !== userId) {
    throw new ApiError(403, "Unauthorized");
  }

  listing.images.push(...images);
  await listing.save();

  res.json(
    new ApiResponse(200, listing.images, "Images added successfully")
  );
});

export const removeListingImage = asyncHandler(async (req, res) => {
  const { id, imageId } = req.params;
  const userId = getUserId(req);

  const listing = await STListing.findById(id);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  if (listing.sellerId !== userId) {
    throw new ApiError(403, "Unauthorized");
  }

  listing.images = listing.images.filter(img => img._id.toString() !== imageId);

  // Ensure at least one cover image
  if (listing.images.length > 0 && !listing.images.some(img => img.isCover)) {
    listing.images[0].isCover = true;
  }

  await listing.save();

  res.json(
    new ApiResponse(200, listing.images, "Image removed successfully")
  );
});

export const setPrimaryImage = asyncHandler(async (req, res) => {
  const { id, imageId } = req.params;
  const userId = getUserId(req);

  const listing = await STListing.findById(id);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  if (listing.sellerId !== userId) {
    throw new ApiError(403, "Unauthorized");
  }

  listing.images.forEach(img => {
    img.isCover = img._id.toString() === imageId;
  });

  await listing.save();

  res.json(
    new ApiResponse(200, listing.images, "Primary image updated")
  );
});

/* ========== DELETE LISTINGS ========== */
export const deleteListing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = getUserId(req);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid listing ID");
  }

  const listing = await STListing.findById(id);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  if (listing.sellerId !== userId) {
    throw new ApiError(403, "You can only delete your own listings");
  }

  // Check for pending interests
  const pendingInterest = await STInterest.findOne({
    listingId: id,
    status: "pending"
  });

  if (pendingInterest) {
    throw new ApiError(400, "Cannot delete listing with pending interests");
  }

  await listing.deleteOne();

  res.json(
    new ApiResponse(200, null, "Listing deleted successfully")
  );
});

/* ========== STATS ========== */
export const getListingStats = asyncHandler(async (req, res) => {
  const userId = getUserId(req);

  const stats = await STListing.aggregate([
    { $match: { sellerId: userId } },
    { $group: {
      _id: null,
      totalListings: { $sum: 1 },
      activeListings: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
      soldListings: { $sum: { $cond: [{ $eq: ["$status", "sold"] }, 1, 0] } },
      archivedListings: { $sum: { $cond: [{ $eq: ["$status", "archived"] }, 1, 0] } },
      pendingCompletion: { $sum: { $cond: [{ $eq: ["$status", "pending_completion"] }, 1, 0] } },
      averagePrice: { $avg: "$basePrice" }
      // views if you add them later
    }}
  ]);

  // Category breakdown
  const categoryBreakdown = await STListing.aggregate([
    { $match: { sellerId: userId } },
    { $group: {
      _id: "$category",
      count: { $sum: 1 },
      active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
      sold: { $sum: { $cond: [{ $eq: ["$status", "sold"] }, 1, 0] } }
    }},
    { $lookup: {
      from: "st_categories",
      localField: "_id",
      foreignField: "_id",
      as: "categoryInfo"
    }},
    { $unwind: "$categoryInfo" },
    { $project: {
      categoryName: "$categoryInfo.name",
      count: 1,
      active: 1,
      sold: 1
    }},
    { $sort: { count: -1 } }
  ]);

  res.json(
    new ApiResponse(200, {
      overview: stats[0] || {
        totalListings: 0,
        activeListings: 0,
        soldListings: 0,
        archivedListings: 0,
        pendingCompletion: 0,
        averagePrice: 0
      },
      categoryBreakdown
    }, "Stats fetched successfully")
  );
});