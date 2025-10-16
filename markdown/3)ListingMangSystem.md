# 📦 Listing Management System - Comprehensive Guide

_Complete implementation guide for the Campus Marketplace listing system_

---

## 🎯 System Overview

The Listing Management System is the core component of the Campus Marketplace, enabling students to create, browse, search, and manage product listings. This system handles everything from simple item posting to advanced marketplace features like pricing history, view tracking, and social interactions.

### **Key Objectives:**

- Enable seamless item listing creation and management
- Provide powerful search and filtering capabilities
- Track listing performance and user engagement
- Ensure data integrity and user authorization
- Support various item categories specific to campus needs
- Implement marketplace best practices for user experience

---

## 🏗️ Architecture Overview

### **System Components:**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend UI   │ ←→ │  Backend API     │ ←→ │   MongoDB       │
│                 │    │                  │    │                 │
│ - Create Form   │    │ - Controllers    │    │ - Listing Model │
│ - Browse Grid   │    │ - Routes         │    │ - Indexes       │
│ - Search Filter │    │ - Middleware     │    │ - Aggregations  │
│ - Detail View   │    │ - Validation     │    │ - Relationships │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌──────────────────┐
                    │   File Storage   │
                    │  (Cloudinary)    │
                    └──────────────────┘
```

### **Data Flow:**

1. **User Request** → Frontend captures user interaction
2. **API Call** → Frontend sends HTTP request to backend
3. **Authentication** → Middleware verifies user permissions
4. **Validation** → Request data validated against schema
5. **Database Operation** → MongoDB performs CRUD operations
6. **Response** → Formatted response sent back to frontend
7. **UI Update** → Frontend updates interface with new data

---

## 📊 Database Schema Deep Dive

### **Listing Model Structure:**

```javascript
// Core Fields
{
  title: String,              // Item name (3-100 chars)
  description: String,        // Detailed description (10-2000 chars)
  price: Number,             // Current price (0-1,000,000)
  originalPrice: Number,     // Original/MRP price (optional)
  priceHistory: [{           // Price change tracking
    price: Number,
    changedAt: Date,
    reason: String
  }],
  negotiable: Boolean,       // Whether price is negotiable

  // Media & Visual
  images: [{
    url: String,             // Image URL
    publicId: String,        // Cloudinary public ID
    isPrimary: Boolean       // Primary display image
  }],

  // Categorization
  category: String,          // Main category (enum)
  subcategory: String,       // Optional subcategory
  condition: String,         // Item condition (enum)
  brand: String,            // Brand name (optional)
  model: String,            // Model/variant (optional)
  tags: [String],           // Search tags

  // Ownership & Status
  owner: ObjectId,          // Listing creator (User ref)
  status: String,           // active/sold/reserved/expired/banned
  isAvailable: Boolean,     // Quick availability check
  isFeatured: Boolean,      // Promoted listing
  isUrgent: Boolean,        // Urgent sale indicator

  // Location & Delivery
  location: {
    hostel: String,         // Seller's hostel (enum)
    pickupPoint: String,    // Specific pickup location
    deliveryAvailable: Boolean // Delivery option
  },

  // Engagement Metrics
  views: {
    total: Number,          // Total view count
    unique: Number,         // Unique viewer count
    recent: [{             // Recent view tracking
      user: ObjectId,
      viewedAt: Date,
      source: String
    }]
  },
  likes: [ObjectId],        // Users who liked this listing
  watchers: [{             // Users watching for updates
    user: ObjectId,
    addedAt: Date
  }],

  // Sales Tracking
  soldTo: ObjectId,         // Buyer (when sold)
  soldAt: Date,            // Sale completion date
  soldPrice: Number,       // Final sale price

  // Lifecycle Management
  expiresAt: Date,         // Auto-expiry date (90 days default)
  lastBumpedAt: Date,      // Last time listing was "bumped"
  boostHistory: [{         // Promotion history
    boostType: String,
    expiresAt: Date,
    createdAt: Date
  }],

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### **Enumerations & Constants:**

```javascript
// Categories specific to campus marketplace
const CATEGORIES = [
  "books", // Textbooks, novels, academic material
  "electronics", // Laptops, phones, accessories, gadgets
  "cycle", // Bicycles and cycling accessories
  "hostel-item", // Furniture, appliances, room essentials
  "clothing", // Clothes, shoes, accessories
  "stationery", // Pens, notebooks, art supplies
  "food", // Packaged food, snacks, beverages
  "other", // Miscellaneous items
];

// Item condition standards
const CONDITIONS = [
  "new", // Brand new, unused
  "like-new", // Barely used, excellent condition
  "good", // Normal wear, fully functional
  "fair", // Visible wear, minor issues
  "poor", // Significant wear, needs repair
];

// Listing lifecycle status
const LISTING_STATUS = [
  "active", // Available for purchase
  "sold", // Successfully sold
  "reserved", // Reserved for specific buyer
  "expired", // Auto-expired after 90 days
  "banned", // Removed by admin/moderator
];

// IIT Bhilai hostels
const HOSTELS = [
  "kanhar", // Kanhar Hostel
  "Gopad", // Gopad Hostel
  "Indravati", // Indravati Hostel
  "Shivnath", // Shivnath Hostel
];
```

---

## 🔧 Backend Implementation

### **Controller Functions Overview:**

```javascript
// listing.controller.js - Complete Function List

// Core CRUD Operations
├── createListing()           // Create new listing with validation
├── getAllListings()          // Browse listings with pagination & filters
├── getListingById()          // Get detailed listing information
├── updateListing()           // Update listing (owner/admin only)
├── deleteListing()           // Soft delete listing (owner/admin only)

// User-Specific Operations
├── getUserListings()         // Get all listings by specific user
├── getMyListings()          // Get current user's listings
├── getDashboardStats()       // Seller dashboard statistics

// Search & Discovery
├── searchListings()          // Advanced search with multiple filters
├── getPopularListings()      // Trending and popular items
├── getSimilarListings()      // Related/similar listings
├── getRecommendations()      // Personalized recommendations

// Engagement Features
├── toggleLike()             // Like/unlike listing
├── addToWatchlist()         // Add to user's watchlist
├── removeFromWatchlist()    // Remove from watchlist
├── incrementViews()         // Track listing views

// Status Management
├── toggleListingStatus()     // Activate/deactivate listing
├── markAsSold()             // Mark listing as sold
├── reserveListing()         // Reserve for specific buyer
├── bumpListing()            // Refresh listing position

// Analytics & Reporting
├── getListingAnalytics()    // Detailed listing performance
├── getViewHistory()         // View tracking data
├── getPriceHistory()        // Price change history
├── generateReport()         // Admin reporting functions

// Utility Functions
├── validateListingData()    // Input validation helper
├── processImages()          // Image upload/processing
├── updatePriceHistory()     // Track price changes
├── checkOwnership()         // Verify listing ownership
├── sendNotifications()      // Notify watchers of updates
```

### **Detailed Function Implementations:**

#### **1. createListing() - Core Creation Function**

```javascript
const createListing = asyncHandler(async (req, res) => {
  // Input validation
  const {
    title,
    description,
    price,
    originalPrice,
    category,
    subcategory,
    condition,
    brand,
    model,
    images,
    negotiable,
    tags,
    location,
    isUrgent,
  } = req.body;

  // Validation checks
  if (!title || title.trim().length < 3) {
    throw new ApiError(400, "Title must be at least 3 characters long");
  }

  if (!description || description.trim().length < 10) {
    throw new ApiError(400, "Description must be at least 10 characters long");
  }

  if (!price || price < 0) {
    throw new ApiError(400, "Price must be a positive number");
  }

  if (!CATEGORIES.includes(category)) {
    throw new ApiError(400, "Invalid category selected");
  }

  if (!CONDITIONS.includes(condition)) {
    throw new ApiError(400, "Invalid condition specified");
  }

  if (!images || !Array.isArray(images) || images.length === 0) {
    throw new ApiError(400, "At least one image is required");
  }

  // Process and validate images
  const processedImages = images.map((img, index) => ({
    url: img.url,
    publicId: img.publicId,
    isPrimary: index === 0, // First image is primary by default
  }));

  // Create listing object
  const listingData = {
    title: title.trim(),
    description: description.trim(),
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    category,
    subcategory: subcategory?.trim(),
    condition,
    brand: brand?.trim(),
    model: model?.trim(),
    images: processedImages,
    negotiable: Boolean(negotiable),
    tags: tags?.map((tag) => tag.toLowerCase().trim()).filter(Boolean) || [],
    location: {
      hostel: location.hostel,
      pickupPoint: location.pickupPoint?.trim(),
      deliveryAvailable: Boolean(location.deliveryAvailable),
    },
    isUrgent: Boolean(isUrgent),
    owner: req.user._id,
    status: "active",
    isAvailable: true,
  };

  // Create listing in database
  const listing = await Listing.create(listingData);

  // Populate owner information for response
  await listing.populate("owner", "name username profileImage trustScore");

  // Send success response
  return res
    .status(201)
    .json(new ApiResponse(201, listing, "Listing created successfully"));
});
```

#### **2. getAllListings() - Advanced Browse Function**

```javascript
const getAllListings = asyncHandler(async (req, res) => {
  // Extract query parameters
  const {
    page = 1,
    limit = 20,
    category,
    condition,
    minPrice,
    maxPrice,
    hostel,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    isUrgent,
    isFeatured,
    negotiable,
  } = req.query;

  // Build filter object
  const filter = {
    status: "active",
    isAvailable: true,
  };

  // Category filter
  if (category && CATEGORIES.includes(category)) {
    filter.category = category;
  }

  // Condition filter
  if (condition && CONDITIONS.includes(condition)) {
    filter.condition = condition;
  }

  // Price range filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Location filter
  if (hostel && HOSTELS.includes(hostel)) {
    filter["location.hostel"] = hostel;
  }

  // Boolean filters
  if (isUrgent !== undefined) {
    filter.isUrgent = Boolean(isUrgent);
  }

  if (isFeatured !== undefined) {
    filter.isFeatured = Boolean(isFeatured);
  }

  if (negotiable !== undefined) {
    filter.negotiable = Boolean(negotiable);
  }

  // Text search filter
  if (search && search.trim()) {
    filter.$text = { $search: search.trim() };
  }

  // Sort options
  const sortOptions = {};
  const validSortFields = ["price", "createdAt", "views.total", "title"];

  if (validSortFields.includes(sortBy)) {
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
  } else {
    sortOptions.createdAt = -1; // Default sort
  }

  // Add featured listings priority
  if (!search) {
    // Don't override text search scoring
    sortOptions.isFeatured = -1; // Featured items first
  }

  // Pagination options
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sortOptions,
    populate: [
      {
        path: "owner",
        select: "name username profileImage trustScore",
      },
    ],
    select: "-views.recent -watchers -boostHistory", // Exclude heavy fields
    lean: false, // Keep virtuals
  };

  // Execute paginated query
  const result = await Listing.paginate(filter, options);

  // Enhance response with metadata
  const response = {
    listings: result.docs,
    pagination: {
      currentPage: result.page,
      totalPages: result.totalPages,
      totalListings: result.totalDocs,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
      limit: result.limit,
    },
    filters: {
      applied: {
        category,
        condition,
        priceRange: { min: minPrice, max: maxPrice },
        hostel,
        search,
        isUrgent,
        isFeatured,
        negotiable,
      },
      available: {
        categories: CATEGORIES,
        conditions: CONDITIONS,
        hostels: HOSTELS,
      },
    },
  };

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Listings retrieved successfully"));
});
```

#### **3. searchListings() - Advanced Search Engine**

```javascript
const searchListings = asyncHandler(async (req, res) => {
  const {
    q: searchQuery,
    category,
    condition,
    priceMin,
    priceMax,
    hostel,
    tags,
    brand,
    model,
    negotiable,
    isUrgent,
    sortBy = "relevance",
    page = 1,
    limit = 20,
  } = req.query;

  // Build aggregation pipeline for advanced search
  const pipeline = [];

  // Stage 1: Text search (if query provided)
  if (searchQuery && searchQuery.trim()) {
    pipeline.push({
      $match: {
        $text: { $search: searchQuery.trim() },
      },
    });

    // Add text score for relevance sorting
    pipeline.push({
      $addFields: {
        textScore: { $meta: "textScore" },
      },
    });
  }

  // Stage 2: Basic filters
  const matchConditions = {
    status: "active",
    isAvailable: true,
  };

  if (category) matchConditions.category = category;
  if (condition) matchConditions.condition = condition;
  if (hostel) matchConditions["location.hostel"] = hostel;
  if (negotiable !== undefined)
    matchConditions.negotiable = Boolean(negotiable);
  if (isUrgent !== undefined) matchConditions.isUrgent = Boolean(isUrgent);

  // Price range filter
  if (priceMin || priceMax) {
    matchConditions.price = {};
    if (priceMin) matchConditions.price.$gte = Number(priceMin);
    if (priceMax) matchConditions.price.$lte = Number(priceMax);
  }

  // Tags filter (match any of the provided tags)
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : tags.split(",");
    matchConditions.tags = {
      $in: tagArray.map((tag) => tag.toLowerCase().trim()),
    };
  }

  // Brand/Model filters (case-insensitive regex)
  if (brand) {
    matchConditions.brand = {
      $regex: brand.trim(),
      $options: "i",
    };
  }

  if (model) {
    matchConditions.model = {
      $regex: model.trim(),
      $options: "i",
    };
  }

  pipeline.push({ $match: matchConditions });

  // Stage 3: Sorting
  const sortStage = {};

  switch (sortBy) {
    case "relevance":
      if (searchQuery) {
        sortStage.textScore = { $meta: "textScore" };
      }
      sortStage.isFeatured = -1;
      sortStage.createdAt = -1;
      break;
    case "price_low":
      sortStage.price = 1;
      break;
    case "price_high":
      sortStage.price = -1;
      break;
    case "newest":
      sortStage.createdAt = -1;
      break;
    case "oldest":
      sortStage.createdAt = 1;
      break;
    case "popular":
      sortStage["views.total"] = -1;
      sortStage.likesCount = -1;
      break;
    default:
      sortStage.isFeatured = -1;
      sortStage.createdAt = -1;
  }

  pipeline.push({ $sort: sortStage });

  // Stage 4: Populate owner information
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "owner",
      pipeline: [
        { $project: { name: 1, username: 1, profileImage: 1, trustScore: 1 } },
      ],
    },
  });

  pipeline.push({
    $unwind: "$owner",
  });

  // Stage 5: Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: parseInt(limit) });

  // Execute aggregation
  const [listings, totalCount] = await Promise.all([
    Listing.aggregate(pipeline),
    Listing.countDocuments(matchConditions),
  ]);

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / parseInt(limit));
  const hasNextPage = parseInt(page) < totalPages;
  const hasPrevPage = parseInt(page) > 1;

  const response = {
    listings,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalListings: totalCount,
      hasNextPage,
      hasPrevPage,
      limit: parseInt(limit),
    },
    searchMetadata: {
      query: searchQuery,
      resultsCount: listings.length,
      totalResults: totalCount,
      searchTime: Date.now(), // Could be enhanced with actual timing
      suggestions: [], // Could be enhanced with search suggestions
    },
  };

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Search completed successfully"));
});
```

### **Route Definitions:**

```javascript
// listing.routes.js - Complete Route Structure

import { Router } from "express";
import {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  getUserListings,
  searchListings,
  toggleLike,
  incrementViews,
  // ... other imports
} from "../controllers/listing.controller.js";
import { verifyJWT, checkRole } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Public routes (no authentication required)
router.route("/").get(getAllListings); // GET /api/listings
router.route("/search").get(searchListings); // GET /api/listings/search
router.route("/categories").get(getCategories); // GET /api/listings/categories
router.route("/popular").get(getPopularListings); // GET /api/listings/popular
router.route("/trending").get(getTrendingListings); // GET /api/listings/trending
router.route("/:id").get(getListingById); // GET /api/listings/:id
router.route("/:id/similar").get(getSimilarListings); // GET /api/listings/:id/similar

// Protected routes (authentication required)
router.use(verifyJWT); // Apply authentication to all routes below

// Listing management
router.route("/").post(
  upload.array("images", 10), // Handle file uploads
  createListing // POST /api/listings
);

router.route("/:id").put(
  checkOwnershipOrRole(["admin", "moderator"]),
  updateListing // PUT /api/listings/:id
);

router.route("/:id").delete(
  checkOwnershipOrRole(["admin", "moderator"]),
  deleteListing // DELETE /api/listings/:id
);

// User-specific routes
router.route("/user/mine").get(getMyListings); // GET /api/listings/user/mine
router.route("/user/:userId").get(getUserListings); // GET /api/listings/user/:userId
router.route("/user/dashboard").get(getDashboardStats); // GET /api/listings/user/dashboard

// Engagement routes
router.route("/:id/like").post(toggleLike); // POST /api/listings/:id/like
router.route("/:id/view").post(incrementViews); // POST /api/listings/:id/view
router.route("/:id/watch").post(addToWatchlist); // POST /api/listings/:id/watch
router.route("/:id/watch").delete(removeFromWatchlist); // DELETE /api/listings/:id/watch

// Status management
router.route("/:id/toggle-status").patch(
  checkOwnership,
  toggleListingStatus // PATCH /api/listings/:id/toggle-status
);

router.route("/:id/mark-sold").patch(
  checkOwnership,
  markAsSold // PATCH /api/listings/:id/mark-sold
);

router.route("/:id/bump").post(
  checkOwnership,
  bumpListing // POST /api/listings/:id/bump
);

// Analytics routes
router.route("/:id/analytics").get(
  checkOwnershipOrRole(["admin"]),
  getListingAnalytics // GET /api/listings/:id/analytics
);

// Admin-only routes
router.use(checkRole(["admin", "moderator"]));

router.route("/admin/featured").get(getFeaturedListings); // GET /api/listings/admin/featured
router.route("/admin/reported").get(getReportedListings); // GET /api/listings/admin/reported
router.route("/:id/feature").patch(toggleFeatureStatus); // PATCH /api/listings/:id/feature
router.route("/:id/ban").patch(banListing); // PATCH /api/listings/:id/ban

export default router;
```

---

## 🔐 Security & Validation

### **Input Validation Strategy:**

```javascript
// Validation middleware examples

// Title validation
const validateTitle = (title) => {
  if (!title || typeof title !== "string") {
    throw new ApiError(400, "Title is required and must be a string");
  }

  const trimmedTitle = title.trim();

  if (trimmedTitle.length < 3) {
    throw new ApiError(400, "Title must be at least 3 characters long");
  }

  if (trimmedTitle.length > 100) {
    throw new ApiError(400, "Title cannot exceed 100 characters");
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\b(urgent|cash|loan|money)\b/gi,
    /[0-9]{10,}/g, // Long number sequences (potential phone numbers)
    /@[a-zA-Z0-9]/g, // Email patterns
  ];

  if (suspiciousPatterns.some((pattern) => pattern.test(trimmedTitle))) {
    throw new ApiError(400, "Title contains prohibited content");
  }

  return trimmedTitle;
};

// Price validation
const validatePrice = (price, originalPrice) => {
  if (typeof price !== "number" || price < 0) {
    throw new ApiError(400, "Price must be a positive number");
  }

  if (price > 1000000) {
    throw new ApiError(400, "Price cannot exceed ₹10,00,000");
  }

  if (
    originalPrice &&
    (typeof originalPrice !== "number" || originalPrice < price)
  ) {
    throw new ApiError(
      400,
      "Original price must be greater than or equal to current price"
    );
  }

  return price;
};

// Image validation
const validateImages = (images) => {
  if (!Array.isArray(images) || images.length === 0) {
    throw new ApiError(400, "At least one image is required");
  }

  if (images.length > 10) {
    throw new ApiError(400, "Maximum 10 images allowed");
  }

  images.forEach((img, index) => {
    if (!img.url || typeof img.url !== "string") {
      throw new ApiError(400, `Image ${index + 1}: URL is required`);
    }

    if (!img.url.startsWith("https://")) {
      throw new ApiError(
        400,
        `Image ${index + 1}: Only HTTPS URLs are allowed`
      );
    }

    // Validate image URL format (basic check)
    const validImageExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const hasValidExtension = validImageExtensions.some((ext) =>
      img.url.toLowerCase().includes(ext)
    );

    if (!hasValidExtension && !img.url.includes("cloudinary.com")) {
      throw new ApiError(400, `Image ${index + 1}: Invalid image format`);
    }
  });

  return images;
};
```

### **Authorization Middleware:**

```javascript
// Check listing ownership
const checkOwnership = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const listing = await Listing.findById(id);

  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  if (listing.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

  req.listing = listing; // Attach listing to request for use in controller
  next();
});

// Check ownership or specific roles
const checkOwnershipOrRole = (allowedRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;
    const userRoles = req.user.roles;

    // Check if user has required role
    const hasRequiredRole = allowedRoles.some((role) =>
      userRoles.includes(role)
    );

    if (hasRequiredRole) {
      return next(); // Admin/moderator can proceed
    }

    // Check ownership for regular users
    const listing = await Listing.findById(id);

    if (!listing) {
      throw new ApiError(404, "Listing not found");
    }

    if (listing.owner.toString() !== userId.toString()) {
      throw new ApiError(403, "You are not authorized to perform this action");
    }

    req.listing = listing;
    next();
  });
};
```

---

## 📱 Frontend Implementation Guide

### **Component Architecture:**

```
src/components/listings/
├── browse/
│   ├── ListingGrid.jsx           # Grid layout for browsing
│   ├── ListingCard.jsx           # Individual listing card
│   ├── ListingFilters.jsx        # Search and filter sidebar
│   ├── ListingSorter.jsx         # Sort options dropdown
│   └── ListingPagination.jsx     # Pagination controls
├── detail/
│   ├── ListingDetail.jsx         # Main detail page component
│   ├── ImageGallery.jsx          # Image carousel/gallery
│   ├── ListingInfo.jsx           # Basic listing information
│   ├── SellerCard.jsx            # Seller profile card
│   ├── PriceHistory.jsx          # Price tracking chart
│   └── SimilarListings.jsx       # Related items section
├── create/
│   ├── CreateListingForm.jsx     # Multi-step creation form
│   ├── BasicInfoStep.jsx         # Title, description, category
│   ├── PricingStep.jsx           # Price, negotiable, original price
│   ├── MediaStep.jsx             # Image upload and management
│   ├── LocationStep.jsx          # Hostel, pickup point, delivery
│   └── ReviewStep.jsx            # Final review before submission
├── manage/
│   ├── MyListings.jsx            # User's listing management dashboard
│   ├── ListingStats.jsx          # Individual listing analytics
│   ├── BulkActions.jsx           # Multi-select operations
│   └── ListingEditor.jsx         # Edit existing listing
└── common/
    ├── CategoryIcon.jsx          # Category-specific icons
    ├── ConditionBadge.jsx        # Condition indicator
    ├── PriceBadge.jsx            # Price display with formatting
    ├── LocationBadge.jsx         # Hostel/location display
    └── ActionButtons.jsx         # Like, share, watch buttons
```

### **Key Frontend Features:**

#### **1. Advanced Search Interface:**

```jsx
// ListingFilters.jsx - Comprehensive filter component
const ListingFilters = ({ onFilterChange, initialFilters }) => {
  const [filters, setFilters] = useState({
    category: "",
    condition: "",
    priceRange: { min: "", max: "" },
    hostel: "",
    negotiable: null,
    isUrgent: null,
    tags: [],
    ...initialFilters,
  });

  const categories = [
    { value: "books", label: "Books", icon: "📚" },
    { value: "electronics", label: "Electronics", icon: "💻" },
    { value: "cycle", label: "Cycles", icon: "🚲" },
    { value: "hostel-item", label: "Hostel Items", icon: "🏠" },
    // ... more categories
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>

      {/* Category Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range (₹)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceRange.min}
            onChange={(e) =>
              handleFilterChange("priceRange", {
                ...filters.priceRange,
                min: e.target.value,
              })
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <span className="self-center text-gray-500">to</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceRange.max}
            onChange={(e) =>
              handleFilterChange("priceRange", {
                ...filters.priceRange,
                max: e.target.value,
              })
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Condition Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Condition
        </label>
        <div className="space-y-2">
          {CONDITIONS.map((condition) => (
            <label key={condition} className="flex items-center">
              <input
                type="radio"
                name="condition"
                value={condition}
                checked={filters.condition === condition}
                onChange={(e) =>
                  handleFilterChange("condition", e.target.value)
                }
                className="mr-2"
              />
              <ConditionBadge condition={condition} />
            </label>
          ))}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Filters
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.negotiable === true}
              onChange={(e) =>
                handleFilterChange("negotiable", e.target.checked ? true : null)
              }
              className="mr-2"
            />
            Negotiable Price
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.isUrgent === true}
              onChange={(e) =>
                handleFilterChange("isUrgent", e.target.checked ? true : null)
              }
              className="mr-2"
            />
            Urgent Sale
          </label>
        </div>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={() => {
          const clearedFilters = {
            category: "",
            condition: "",
            priceRange: { min: "", max: "" },
            hostel: "",
            negotiable: null,
            isUrgent: null,
            tags: [],
          };
          setFilters(clearedFilters);
          onFilterChange(clearedFilters);
        }}
        className="w-full px-4 py-2 text-sm text-gray-600 bg-gray-100 
                   hover:bg-gray-200 rounded-md transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
};
```

#### **2. Listing Creation Flow:**

```jsx
// CreateListingForm.jsx - Multi-step form component
const CreateListingForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    condition: "good",
    price: "",
    originalPrice: "",
    negotiable: true,
    images: [],
    brand: "",
    model: "",
    tags: [],
    location: {
      hostel: "",
      pickupPoint: "",
      deliveryAvailable: false,
    },
    isUrgent: false,
  });

  const steps = [
    { id: 1, name: "Basic Info", component: BasicInfoStep },
    { id: 2, name: "Pricing", component: PricingStep },
    { id: 3, name: "Images", component: MediaStep },
    { id: 4, name: "Location", component: LocationStep },
    { id: 5, name: "Review", component: ReviewStep },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await api.post("/listings", formData);
      toast.success("Listing created successfully!");
      navigate(`/listings/${response.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create listing");
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${
                index < steps.length - 1 ? "flex-1" : ""
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center
                  ${
                    currentStep >= step.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
              >
                {currentStep > step.id ? "✓" : step.id}
              </div>
              <span
                className={`ml-2 text-sm ${
                  currentStep >= step.id ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    currentStep > step.id ? "bg-blue-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <CurrentStepComponent
          formData={formData}
          setFormData={setFormData}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSubmit={handleSubmit}
          isLastStep={currentStep === steps.length}
        />
      </div>
    </div>
  );
};
```

---

## 📊 Analytics & Monitoring

### **Performance Metrics to Track:**

```javascript
// Listing analytics schema
const listingAnalytics = {
  // Engagement Metrics
  views: {
    total: Number, // Total view count
    unique: Number, // Unique viewers
    daily: [
      {
        // Daily breakdown
        date: Date,
        views: Number,
        uniqueViews: Number,
      },
    ],
    sources: {
      // Traffic sources
      direct: Number, // Direct URL access
      search: Number, // From search results
      category: Number, // Category browsing
      recommended: Number, // From recommendations
    },
  },

  // User Interactions
  engagement: {
    likes: Number, // Total likes received
    watchlistAdds: Number, // Times added to watchlist
    shares: Number, // Social shares
    inquiries: Number, // Chat messages received
    phoneReveals: Number, // Contact info reveals
  },

  // Conversion Metrics
  conversion: {
    viewToInquiry: Number, // Inquiry rate from views
    inquiryToSale: Number, // Sale rate from inquiries
    averageNegotiation: Number, // Avg negotiation amount
    timeToSale: Number, // Days from listing to sale
  },

  // Search Performance
  searchMetrics: {
    impressions: Number, // Times shown in search
    clicks: Number, // Clicks from search
    ctr: Number, // Click-through rate
    avgPosition: Number, // Average search position
    topKeywords: [String], // Keywords that found this listing
  },
};
```

### **Real-time Monitoring:**

```javascript
// Performance monitoring functions
const monitorListingPerformance = () => {
  // Database query performance
  const trackSlowQueries = (threshold = 1000) => {
    mongoose.set("debug", (collectionName, method, query, doc, options) => {
      const startTime = Date.now();

      return function () {
        const duration = Date.now() - startTime;
        if (duration > threshold) {
          console.warn(`Slow query detected: ${method} on ${collectionName}`, {
            duration: `${duration}ms`,
            query: JSON.stringify(query),
            options: JSON.stringify(options),
          });
        }
      };
    });
  };

  // API endpoint monitoring
  const trackAPIPerformance = (req, res, next) => {
    const startTime = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const route = req.route?.path || req.path;

      // Log slow endpoints
      if (duration > 2000) {
        console.warn(`Slow API endpoint: ${req.method} ${route}`, {
          duration: `${duration}ms`,
          statusCode: res.statusCode,
          userAgent: req.get("User-Agent"),
        });
      }

      // Track metrics (could send to monitoring service)
      metrics.record("api.request.duration", duration, {
        method: req.method,
        route,
        statusCode: res.statusCode,
      });
    });

    next();
  };
};
```

---

## 🚀 Deployment & Scaling

### **Database Optimization:**

```javascript
// Index optimization for production
db.listings.createIndex(
  {
    title: "text",
    description: "text",
    tags: "text",
  },
  {
    weights: {
      title: 10,
      tags: 5,
      description: 1,
    },
    name: "search_index",
  }
);

// Compound indexes for common queries
db.listings.createIndex({
  category: 1,
  status: 1,
  isAvailable: 1,
  createdAt: -1,
});

db.listings.createIndex({
  owner: 1,
  status: 1,
  createdAt: -1,
});

db.listings.createIndex({
  "location.hostel": 1,
  category: 1,
  price: 1,
});

// Geospatial index for future location features
db.listings.createIndex({
  "location.coordinates": "2dsphere",
});
```

### **Caching Strategy:**

```javascript
// Redis caching for popular listings
const cachePopularListings = async () => {
  const cacheKey = "listings:popular:24h";
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const popularListings = await Listing.find({
    status: "active",
    isAvailable: true,
  })
    .sort({ "views.total": -1, likesCount: -1 })
    .limit(50)
    .populate("owner", "name username profileImage")
    .lean();

  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(popularListings));

  return popularListings;
};

// Cache search results
const cacheSearchResults = async (query, results) => {
  const cacheKey = `search:${crypto
    .createHash("md5")
    .update(JSON.stringify(query))
    .digest("hex")}`;

  // Cache search results for 15 minutes
  await redis.setex(cacheKey, 900, JSON.stringify(results));
};
```

---

## ✅ Testing Strategy

### **Unit Tests:**

```javascript
// listing.controller.test.js
describe("Listing Controller", () => {
  describe("createListing", () => {
    it("should create a listing with valid data", async () => {
      const listingData = {
        title: "Test Laptop",
        description: "Great condition laptop for sale",
        price: 25000,
        category: "electronics",
        condition: "good",
        images: [{ url: "https://example.com/image.jpg" }],
        location: { hostel: "kanhar" },
      };

      const req = {
        body: listingData,
        user: { _id: "user123" },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await createListing(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            title: "Test Laptop",
          }),
        })
      );
    });

    it("should reject listing with invalid price", async () => {
      const listingData = {
        title: "Test Item",
        price: -100, // Invalid negative price
      };

      const req = { body: listingData, user: { _id: "user123" } };

      await expect(createListing(req, {})).rejects.toThrow(
        "Price must be a positive number"
      );
    });
  });
});
```

### **Integration Tests:**

```javascript
// listing.integration.test.js
describe("Listing API Integration", () => {
  let authToken;

  beforeEach(async () => {
    // Setup test user and get auth token
    const user = await User.create({
      name: "Test User",
      email: "test@iitbhilai.ac.in",
      password: "password123",
    });

    authToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET);
  });

  it("should get listings with pagination", async () => {
    // Create test listings
    await Listing.create([
      { title: "Item 1", price: 100, owner: userId, category: "books" },
      { title: "Item 2", price: 200, owner: userId, category: "electronics" },
    ]);

    const response = await request(app)
      .get("/api/listings?page=1&limit=10")
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.listings).toHaveLength(2);
    expect(response.body.data.pagination).toHaveProperty("totalListings", 2);
  });
});
```

---

This comprehensive Listing Management System documentation provides everything needed to implement a robust, scalable marketplace listing system. The implementation covers all aspects from database design to frontend components, security measures, and deployment strategies specifically tailored for the Campus Marketplace project.

Key highlights:

- **Complete backend API** with all CRUD operations and advanced features
- **Robust data validation** and security measures
- **Advanced search capabilities** with multiple filters and sorting
- **Comprehensive frontend components** for all user interactions
- **Performance optimization** with caching and indexing strategies
- **Analytics and monitoring** for business insights
- **Testing strategies** for reliability and maintainability

This system will serve as the foundation for the entire Campus Marketplace platform, enabling students at IIT Bhilai to effectively buy, sell, and trade items within their community.
