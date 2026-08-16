import { STListing } from "../models/st_listing.model.js";
import { STCategory } from "../models/st_category.model.js";
import { STRequest } from "../models/st_request.model.js";
import { STOrder } from "../models/st_order.model.js";
import { findUserById } from "../models/users.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { uploadToCloudinary } from "../utils/upload.js";
import { getCachedData, setCachedData, invalidateListingCache } from "../utils/cache.js";

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
    location,
    hostel,
    roomNumber,
    additionalNotes
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

  // Resolve flat location fields — support both flat (hostel) and nested (location.hostel) payloads
  const resolvedHostel = hostel || (location && typeof location === 'object' ? location.hostel : '') || '';
  const resolvedRoomNumber = roomNumber || (location && typeof location === 'object' ? location.roomNumber : '') || '';
  const resolvedAdditionalNotes = additionalNotes || (location && typeof location === 'object' ? (location.landmark || location.additionalNotes) : '') || '';

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
    location: "",           // STListing.location is String — keep empty, use flat fields below
    hostel: resolvedHostel,
    roomNumber: resolvedRoomNumber,
    additionalNotes: resolvedAdditionalNotes
  };

  const listing = await STListing.create(listingData);
  
  // Populate category for response
  await listing.populate("category");

  // Invalidate cache since a new listing was added
  await invalidateListingCache();

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

  // Try fetching from cache
  const cacheData = await getCachedData("campus:v1:listings", req.query);
  if (cacheData) {
    return res.json(new ApiResponse(200, cacheData, "Listings fetched from cache"));
  }

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

  const responseData = {
  listings: listingsWithSellers,
  pagination: {
    page: Number(page),
    limit: Number(limit),
    total,
    pages: Math.ceil(total / Number(limit))
  }
};

await setCachedData("campus:v1:listings", req.query, responseData, 30);

res.json(new ApiResponse(200, responseData, "Listings fetched successfully"));
});

export const getListingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid listing ID");
  }

  // Attempt to fetch from cache (include user context in queryParams)
  const cacheKey = { id, userId: req.user ? getUserId(req) : null };
  const cacheData = await getCachedData("campus:v1:listing", cacheKey);
  if (cacheData) {
    return res.json(new ApiResponse(200, cacheData, "Listing fetched from cache"));
  }

  const listing = await STListing.findById(id)
    .populate("category", "name slug")
    .lean();

  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  // Get seller details from PostgreSQL
  const seller = await findUserById(listing.sellerId);

  // Check if current user has pending/accepted request (if authenticated)
  let userRequest = null;
  if (req.user) {
    const userId = getUserId(req);
    const request = await STRequest.findOne({
      listingId: id,
      buyerId: userId,
      status: { $in: ["pending", "accepted"] }
    });
    if (request) {
      userRequest = {
        _id: request._id,
        offeredPrice: request.offeredPrice,
        status: request.status
      };
      if (request.status === "accepted") {
        const order = await STOrder.findOne({ requestId: request._id });
        if (order) {
          userRequest.orderId = order._id;
        }
      }
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

  const responseData = {
    ...listing,
    seller: seller ? {
      user_id: seller.user_id,
      first_name: seller.first_name,
      last_name: seller.last_name,
      avatar: seller.avatar,
      joined_date: seller.created_at,
      rating: seller.average_rating || 0,
      email: seller.email,
      phone_number: seller.phone_number
    } : null,
    userRequest,
    similarListings,
    requestCount: listing.requestCount,
    highestOffer: listing.highestOffer
  };

  await setCachedData("campus:v1:listing", cacheKey, responseData, 30);

  res.json(new ApiResponse(200, responseData, "Listing fetched successfully"));
});

export const getSellerListings = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const { page = 1, limit = 10, status = "active" } = req.query;

  const cacheKey = { sellerId, page, limit, status };
  const cacheData = await getCachedData("campus:v1:seller_listings", cacheKey);
  if (cacheData) {
    return res.json(new ApiResponse(200, cacheData, "Seller listings fetched from cache"));
  }

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

  const responseData = {
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
  };

  await setCachedData("campus:v1:seller_listings", cacheKey, responseData, 60);

  res.json(new ApiResponse(200, responseData, "Seller listings fetched successfully"));
});

export const getCategories = asyncHandler(async (req, res) => {
  const cacheData = await getCachedData("campus:v1:categories", {});
  if (cacheData) {
    return res.json(new ApiResponse(200, cacheData, "Categories fetched from cache"));
  }

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

  await setCachedData("campus:v1:categories", {}, categories, 300);

  res.json(new ApiResponse(200, categories, "Categories fetched successfully"));
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

  // Prevent updating restricted fields
  delete updates.sellerId;
  delete updates.requestCount;
  delete updates.highestOffer;
  delete updates.status; // status should be changed via toggle/sold endpoints
  delete updates.acceptedRequestId;
  delete updates.lockedByOrderId;

  // STListing stores location as flat fields — strip any nested location object
  // and promote its fields to top-level if accidentally sent
  if (updates.location && typeof updates.location === 'object') {
    if (updates.location.hostel !== undefined) updates.hostel = updates.location.hostel;
    if (updates.location.roomNumber !== undefined) updates.roomNumber = updates.location.roomNumber;
    if (updates.location.landmark !== undefined) updates.additionalNotes = updates.location.landmark;
    delete updates.location;
  }

  // If category is being updated, validate it
  if (updates.category) {
    const categoryExists = await STCategory.findById(updates.category);
    if (!categoryExists) {
      throw new ApiError(400, "Invalid category");
    }
  }

  console.log("Updating listing with data:", JSON.stringify(updates, null, 2));

  const updatedListing = await STListing.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate("category");

  if (!updatedListing) {
    throw new ApiError(404, "Listing not found after update");
  }

  await invalidateListingCache();

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

  await invalidateListingCache();

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

  await invalidateListingCache();

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

  await invalidateListingCache();

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

  await invalidateListingCache();

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

  // Check for pending requests
  const pendingRequest = await STRequest.findOne({
    listingId: id,
    status: "pending"
  });

  if (pendingRequest) {
    throw new ApiError(400, "Cannot delete listing with pending requests");
  }

  await listing.deleteOne();

  await invalidateListingCache();

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

/* ========== UPLOAD IMAGE TO CLOUDINARY ========== */
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Image file is required");
  }

  const result = await uploadToCloudinary(req.file.path);
  if (!result) {
    throw new ApiError(500, "Failed to upload image to Cloudinary");
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        url: result.secure_url || result.url,
        publicId: result.public_id
      },
      "Image uploaded successfully"
    )
  );
});