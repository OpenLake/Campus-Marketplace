import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { Order } from "../models/order.model.js";  
import { STListing } from "../models/st_listing.model.js";
import { STInterest } from "../models/st_interest.model.js";
import Listing from "../models/listing.model.js";
import { STOrder } from "../models/st_order.model.js";

// Create a new order
export const createOrder = asyncHandler(async (req, res) => {
    const { items, address } = req.body;

    if (!items || items.length === 0) {
        throw new ApiError(400, "No items in order");
    }

    let totalAmount = 0;
    const orderItems = [];
    let sellerId = null;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const quantity = Math.floor(Number(item.quantity));
        if (isNaN(quantity) || quantity <= 0) {
            throw new ApiError(400, `Invalid quantity for item at index ${i}`);
        }

        const listing = await Listing.findById(item.listing);
        if (!listing || !listing.isAvailable || listing.status !== "active") {
            throw new ApiError(400, "One or more items are unavailable");
        }

        if (listing.owner.toString() === req.user._id.toString()) {
            throw new ApiError(400, "You cannot buy your own item");
        }

        if (i === 0) {
            sellerId = listing.owner;
        } else if (listing.owner.toString() !== sellerId.toString()) {
            throw new ApiError(400, "MVP Restriction: Single seller per order only");
        }

        orderItems.push({
            listing: listing._id,
            quantity,
            price: listing.price,
        });
        totalAmount += listing.price * quantity;
    }

    const order = await Order.create({
        buyer: req.user._id,
        seller: sellerId,
        items: orderItems,
        totalAmount,
        address,
        paymentStatus: "pending",
    });

    return res.status(201).json(new ApiResponse(201, order, "Order placed successfully"));
});

// FIXED: Added missing getOrderById export
export const getOrderById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const order = await Order.findById(id)
        .populate("items.listing", "title images price")
        .populate("buyer", "name email phone hostelLocation")
        .populate("seller", "name email phone");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Security check: Only Buyer, Seller, or Admin can view
    const isBuyer = order.buyer._id.toString() === req.user._id.toString();
    const isSeller = order.seller._id.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes("admin");

    if (!isBuyer && !isSeller && !isAdmin) {
        throw new ApiError(403, "Unauthorized to view this order");
    }

    return res.status(200).json(new ApiResponse(200, order, "Order fetched successfully"));
});

// Update Order Status (Seller Only)
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'in-progress', 'delivered', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
        throw new ApiError(400, "Invalid status transition");
    }

    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, "Order not found");

    if (order.seller.toString() !== req.user._id.toString() && !req.user.roles.includes("admin")) {
        throw new ApiError(403, "Unauthorized to update this order");
    }

    order.deliveryStatus = status;

    if (status === "delivered") {
        order.paymentStatus = "completed";
        for (const item of order.items) {
            await Listing.findByIdAndUpdate(item.listing, { isAvailable: false, status: 'sold' });
        }
    }

    await order.save();
    return res.status(200).json(new ApiResponse(200, order, "Status updated"));
});

export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ buyer: req.user._id })
        .populate("items.listing")
        .populate("seller", "name username")
        .sort("-createdAt");
    return res.status(200).json(new ApiResponse(200, orders, "Purchase history fetched"));
});

export const getMySales = asyncHandler(async (req, res) => {
    const sales = await Order.find({ seller: req.user._id })
        .populate("items.listing")
        .populate("buyer", "name username")
        .sort("-createdAt");
    return res.status(200).json(new ApiResponse(200, sales, "Sales history fetched"));
});

// Helper to get user ID from various possible fields
const getUserId = (req) => {
  return req.user?._id || req.user?.user_id || req.user?.id;
};

/* ========== CLUB/VENDOR ORDER FUNCTIONS (unchanged) ========== */
// ... keep your existing createOrder, getOrderById, etc. for club orders ...

/* ========== STUDENT MARKETPLACE INTEREST FUNCTIONS ========== */

// @desc    Express interest in a listing
// @route   POST /api/orders/st/interest
// @access  Private
export const expressInterest = asyncHandler(async (req, res) => {
  const { listingId, offeredPrice, message, buyerImages } = req.body;
  const buyerId = getUserId(req); 
  if (!listingId) {
    throw new ApiError(400, "Listing ID is required");
  }

  // Get listing details
  const listing = await STListing.findById(listingId);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  // Check if listing is active
  if (listing.status !== "active") {
    throw new ApiError(400, "This item is not available for purchase");
  }

  // Prevent self-interest
  if (listing.sellerId === buyerId) {
    throw new ApiError(400, "You cannot express interest in your own item");
  }

  // Check if buyer already has pending interest
  const existingInterest = await STInterest.findOne({
    listingId,
    buyerId,
    status: "pending"
  });

  if (existingInterest) {
    throw new ApiError(400, "You already have a pending interest for this item");
  }

  // Create interest
  const interest = await STInterest.create({
    listingId,
    sellerId: listing.sellerId,
    buyerId,
    offeredPrice: offeredPrice || listing.basePrice,
    message: message || "Interested in this item",
    buyerImages: buyerImages || [],
    status: "pending"
  });

  // Populate listing details for response
  await interest.populate("listingId");
  console.log("Listing sellerId:", listing.sellerId);
  res.status(201).json(
    new ApiResponse(201, interest, "Interest expressed successfully")
  );
});

// @desc    Get my expressed interests (as buyer)
// @route   GET /api/orders/st/my-interests
// @access  Private
export const getMyInterests = asyncHandler(async (req, res) => {
  const buyerId = getUserId(req);
  const { status, page = 1, limit = 10 } = req.query;

  const query = { buyerId };
  if (status) query.status = status;

  const interests = await STInterest.find(query)
    .populate("listingId")
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await STInterest.countDocuments(query);

  res.json(
    new ApiResponse(200, {
      interests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, "Interests fetched successfully")
  );
});

// @desc    Get incoming interests for my listings (as seller)
// @route   GET /api/orders/st/incoming-interests
// @access  Private
export const getIncomingInterests = asyncHandler(async (req, res) => {
  const sellerId = getUserId(req);
  const { status = "pending", page = 1, limit = 10 } = req.query;

  const query = { sellerId, status };

  const interests = await STInterest.find(query)
    .populate("listingId")
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await STInterest.countDocuments(query);

  res.json(
    new ApiResponse(200, {
      interests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, "Incoming interests fetched successfully")
  );
});

// @desc    Accept an interest (creates order, rejects others)
// @route   POST /api/orders/st/accept-interest/:interestId
// @access  Private (Seller only)
export const acceptInterest = asyncHandler(async (req, res) => {
  const { interestId } = req.params;
  const { meetupDetails } = req.body;
  const userId = getUserId(req);

  // Get the interest
  const interest = await STInterest.findById(interestId).populate("listingId");
  if (!interest) {
    throw new ApiError(404, "Interest not found");
  }

  // Verify seller
  if (interest.sellerId !== userId) {
    throw new ApiError(403, "Only the seller can accept interests");
  }

  // Check if still pending
  if (interest.status !== "pending") {
    throw new ApiError(400, "This interest is no longer pending");
  }

  const listing = interest.listingId;
  if (listing.status !== "active") {
    throw new ApiError(400, "This listing is no longer active");
  }

  // --- Atomic operations (should be in a transaction in production) ---
  // 1. Accept this interest
  interest.status = "accepted";
  await interest.save();

  // 2. Reject all other pending interests for this listing
  await STInterest.updateMany(
    { 
      listingId: interest.listingId, 
      status: "pending", 
      _id: { $ne: interestId } 
    },
    { status: "rejected" }
  );

  // 3. Update listing status
  listing.status = "pending_completion";
  await listing.save();

  // 4. Create order
  const order = await STOrder.create({
    interestId: interest._id,
    listingId: interest.listingId,
    buyerId: interest.buyerId,
    sellerId: interest.sellerId,
    finalPrice: interest.offeredPrice,
    meetupDetails: meetupDetails || {},
    statusHistory: [{
      status: "awaiting_meetup",
      changedBy: userId,
      note: "Order created from accepted interest"
    }]
  });

  await order.populate("listingId");

  res.status(201).json(
    new ApiResponse(201, { interest, order }, "Interest accepted, order created")
  );
});

// @desc    Reject an interest
// @route   PATCH /api/orders/st/reject-interest/:interestId
// @access  Private (Seller only)
export const rejectInterest = asyncHandler(async (req, res) => {
  const { interestId } = req.params;
  const userId = getUserId(req);

  const interest = await STInterest.findById(interestId);
  if (!interest) {
    throw new ApiError(404, "Interest not found");
  }

  if (interest.sellerId !== userId) {
    throw new ApiError(403, "Only the seller can reject interests");
  }

  if (interest.status !== "pending") {
    throw new ApiError(400, "This interest is no longer pending");
  }

  interest.status = "rejected";
  await interest.save();

  res.json(
    new ApiResponse(200, interest, "Interest rejected")
  );
});

// @desc    Withdraw my interest (as buyer)
// @route   PATCH /api/orders/st/withdraw-interest/:interestId
// @access  Private (Buyer only)
export const withdrawInterest = asyncHandler(async (req, res) => {
  const { interestId } = req.params;
  const userId = getUserId(req);

  const interest = await STInterest.findById(interestId);
  if (!interest) {
    throw new ApiError(404, "Interest not found");
  }

  if (interest.buyerId !== userId) {
    throw new ApiError(403, "Only the buyer can withdraw their interest");
  }

  if (interest.status !== "pending") {
    throw new ApiError(400, "Can only withdraw pending interests");
  }

  interest.status = "withdrawn";
  await interest.save();

  res.json(
    new ApiResponse(200, interest, "Interest withdrawn")
  );
});

/* ========== UPDATED STUDENT ORDER FUNCTIONS (now using new schema) ========== */

// @desc    Get buyer's orders (My Purchases)
// @route   GET /api/orders/st/my-purchases
// @access  Private
export const getBuyerSTOrders = asyncHandler(async (req, res) => {
  const buyerId = getUserId(req);
  const { status, page = 1, limit = 10 } = req.query;

  const query = { buyerId };
  if (status) query.status = status;

  const orders = await STOrder.find(query)
    .populate("listingId")
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await STOrder.countDocuments(query);

  res.json(
    new ApiResponse(200, {
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, "Orders fetched successfully")
  );
});

// @desc    Get seller's orders (My Sales)
// @route   GET /api/orders/st/my-sales
// @access  Private
export const getSellerSTOrders = asyncHandler(async (req, res) => {
  const sellerId = getUserId(req);
  const { status, page = 1, limit = 10 } = req.query;

  const query = { sellerId };
  if (status) query.status = status;

  const orders = await STOrder.find(query)
    .populate("listingId")
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await STOrder.countDocuments(query);

  res.json(
    new ApiResponse(200, {
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, "Sales fetched successfully")
  );
});

// @desc    Get student order details
// @route   GET /api/orders/st/:id
// @access  Private
export const getSTOrderDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = getUserId(req);

  const order = await STOrder.findById(id)
    .populate("listingId")
    .populate("interestId");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check if user is buyer or seller
  if (order.buyerId !== userId && order.sellerId !== userId) {
    throw new ApiError(403, "Unauthorized");
  }

  res.json(
    new ApiResponse(200, order, "Order details fetched successfully")
  );
});

// @desc    Update student order status
// @route   PATCH /api/orders/st/:id/status
// @access  Private
export const updateSTOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const userId = getUserId(req);

  const order = await STOrder.findById(id).populate("listingId");
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Validate status transition using the model's method
  try {
    await order.updateStatus(status, userId, note);
  } catch (error) {
    throw new ApiError(400, error.message);
  }

  // If order is completed, mark listing as sold
  if (status === "completed") {
    await STListing.findByIdAndUpdate(order.listingId._id, {
      status: "sold"
    });
  }

  res.json(
    new ApiResponse(200, order, `Order ${status} successfully`)
  );
});

// @desc    Get student order statistics
// @route   GET /api/orders/st/stats
// @access  Private
export const getSTOrderStats = asyncHandler(async (req, res) => {
  const userId = getUserId(req);

  const [buyerStats, sellerStats] = await Promise.all([
    STOrder.aggregate([
      { $match: { buyerId: userId } },
      { $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalSpent: { $sum: "$finalPrice" }
      }}
    ]),
    STOrder.aggregate([
      { $match: { sellerId: userId } },
      { $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalEarned: { $sum: "$finalPrice" }
      }}
    ])
  ]);

  const stats = {
    asBuyer: {
      awaiting_meetup: buyerStats.find(s => s._id === "awaiting_meetup")?.count || 0,
      completed: buyerStats.find(s => s._id === "completed")?.count || 0,
      cancelled: buyerStats.find(s => s._id === "cancelled")?.count || 0,
      disputed: buyerStats.find(s => s._id === "disputed")?.count || 0,
      totalSpent: buyerStats.find(s => s._id === "completed")?.totalSpent || 0
    },
    asSeller: {
      awaiting_meetup: sellerStats.find(s => s._id === "awaiting_meetup")?.count || 0,
      completed: sellerStats.find(s => s._id === "completed")?.count || 0,
      cancelled: sellerStats.find(s => s._id === "cancelled")?.count || 0,
      disputed: sellerStats.find(s => s._id === "disputed")?.count || 0,
      totalEarned: sellerStats.find(s => s._id === "completed")?.totalEarned || 0
    }
  };

  res.json(
    new ApiResponse(200, stats, "Order stats fetched successfully")
  );
});

// Optional: Keep old buy-now for backward compatibility, but redirect to interest
export const createSTOrder = asyncHandler(async (req, res) => {
  // Redirect to expressInterest
  return expressInterest(req, res);
});