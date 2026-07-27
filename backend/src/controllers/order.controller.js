import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { Order } from "../models/order.model.js";  
import { STListing } from "../models/st_listing.model.js";
import { STRequest } from "../models/st_request.model.js";
import Listing from "../models/listing.model.js";
import { STOrder } from "../models/st_order.model.js";
import { IdempotencyKey } from "../models/idempotency_key.model.js";
import mongoose from "mongoose";

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

/* ========== STUDENT MARKETPLACE REQUEST FUNCTIONS ========== */

// @desc    Request an item
// @route   POST /api/orders/st/request
// @access  Private
export const requestItem = asyncHandler(async (req, res) => {
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

  // Prevent self-request
  if (listing.sellerId === buyerId) {
    throw new ApiError(400, "You cannot request your own item");
  }

  // Check if buyer already has pending request
  const existingRequest = await STRequest.findOne({
    listingId,
    buyerId,
    status: "pending"
  });

  if (existingRequest) {
    throw new ApiError(400, "You already have a pending request for this item");
  }

  // Create request
  const request = await STRequest.create({
    listingId,
    sellerId: listing.sellerId,
    buyerId,
    offeredPrice: offeredPrice || listing.basePrice,
    message: message || "Request for this item",
    buyerImages: buyerImages || [],
    status: "pending"
  });

  // Populate listing details for response
  await request.populate("listingId");
  console.log("Listing sellerId:", listing.sellerId);
  res.status(201).json(
    new ApiResponse(201, request, "Request item submitted successfully")
  );
});

// @desc    Get my requests (as buyer)
// @route   GET /api/orders/st/my-requests
// @access  Private
export const getMyRequests = asyncHandler(async (req, res) => {
  const buyerId = getUserId(req);
  const { status, page = 1, limit = 10 } = req.query;

  const query = { buyerId };
  if (status) query.status = status;

  const requests = await STRequest.find(query)
    .populate("listingId")
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await STRequest.countDocuments(query);

  res.json(
    new ApiResponse(200, {
      requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, "Requests fetched successfully")
  );
});

// @desc    Get incoming requests for my listings (as seller)
// @route   GET /api/orders/st/incoming-requests
// @access  Private
export const getIncomingRequests = asyncHandler(async (req, res) => {
  const sellerId = getUserId(req);
  const { status = "pending", page = 1, limit = 10 } = req.query;

  const query = { sellerId, status };

  const requests = await STRequest.find(query)
    .populate("listingId")
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await STRequest.countDocuments(query);

  res.json(
    new ApiResponse(200, {
      requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, "Incoming requests fetched successfully")
  );
});

// @desc    Accept a request (creates order, rejects others)
// @route   POST /api/orders/st/accept-request/:requestId
// @access  Private (Seller only)
export const acceptRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { meetupDetails } = req.body;
  const userId = getUserId(req);
  const idempotencyKey = req.header("Idempotency-Key");

  if (!idempotencyKey) {
    throw new ApiError(400, "Idempotency-Key header is required for acceptance");
  }

  // Idempotency check
  const existingKey = await IdempotencyKey.findOne({ key: idempotencyKey });
  if (existingKey) {
    if (existingKey.responseStatus) {
      return res.status(existingKey.responseStatus).json(existingKey.responseBody);
    } else {
      throw new ApiError(409, "Request already in progress");
    }
  }

  const idempRecord = await IdempotencyKey.create({
    key: idempotencyKey,
    actor: userId,
    endpoint: `/api/orders/st/accept-request/${requestId}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });

  let result;
  try {
    // 1. Get the request
    const request = await STRequest.findById(requestId);
    if (!request) throw new ApiError(404, "Request not found");
    if (request.sellerId !== userId) throw new ApiError(403, "Only the seller can accept requests");
    if (request.status !== "pending") throw new ApiError(400, "This request is no longer pending");

    const listing = await STListing.findById(request.listingId);
    if (!listing) throw new ApiError(404, "Listing not found");
    if (listing.status !== "active") throw new ApiError(400, "This listing is no longer active");

    // 2. Accept this request and add the seller's message
    request.status = "accepted";
    if (meetupDetails && meetupDetails.notes) {
      request.sellerMessage = meetupDetails.notes;
    }
    await request.save();

    // 3. Reject all other pending requests for this listing
    await STRequest.updateMany(
      { 
        listingId: request.listingId, 
        status: "pending", 
        _id: { $ne: requestId } 
      },
      { status: "rejected" }
    );

    // 4. Create order
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Default 7-day policy

    const orderDocs = await STOrder.create([{
      requestId: request._id,
      listingId: request.listingId,
      buyerId: request.buyerId,
      sellerId: request.sellerId,
      finalPrice: request.offeredPrice,
      meetupDetails: meetupDetails || {},
      expiresAt,
      statusHistory: [{
        status: "awaiting_meetup",
        changedBy: userId,
        note: "Order created from accepted request"
      }]
    }]);

    const order = orderDocs[0];

    // 5. Update listing status
    listing.status = "pending_completion";
    listing.acceptedRequestId = request._id;
    listing.lockedByOrderId = order._id;
    await listing.save();

    result = { request, order };
  } catch (error) {
    throw error;
  }

  const responseBody = new ApiResponse(201, result, "Request accepted, order created");
  
  idempRecord.responseStatus = 201;
  idempRecord.responseBody = responseBody;
  await idempRecord.save();

  res.status(201).json(responseBody);
});

// @desc    Reject a request
// @route   PATCH /api/orders/st/reject-request/:requestId
// @access  Private (Seller only)
export const rejectRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const userId = getUserId(req);

  const request = await STRequest.findById(requestId);
  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  if (request.sellerId !== userId) {
    throw new ApiError(403, "Only the seller can reject requests");
  }

  if (request.status !== "pending") {
    throw new ApiError(400, "This request is no longer pending");
  }

  request.status = "rejected";
  await request.save();

  res.json(
    new ApiResponse(200, request, "Request rejected")
  );
});

// @desc    Withdraw my request (as buyer)
// @route   PATCH /api/orders/st/withdraw-request/:requestId
// @access  Private (Buyer only)
export const withdrawRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const userId = getUserId(req);

  const request = await STRequest.findById(requestId);
  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  if (request.buyerId !== userId) {
    throw new ApiError(403, "Only the buyer can withdraw their request");
  }

  if (request.status !== "pending") {
    throw new ApiError(400, "Can only withdraw pending requests");
  }

  request.status = "withdrawn";
  await request.save();

  res.json(
    new ApiResponse(200, request, "Request withdrawn")
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
    .populate("requestId");

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
  const { status, note, cancelReason } = req.body;
  const userId = getUserId(req);
  const idempotencyKey = req.header("Idempotency-Key");

  if (!idempotencyKey) {
    throw new ApiError(400, "Idempotency-Key header is required for status updates");
  }

  // Idempotency check
  const existingKey = await IdempotencyKey.findOne({ key: idempotencyKey });
  if (existingKey) {
    if (existingKey.responseStatus) {
      return res.status(existingKey.responseStatus).json(existingKey.responseBody);
    } else {
      throw new ApiError(409, "Request already in progress");
    }
  }

  const idempRecord = await IdempotencyKey.create({
    key: idempotencyKey,
    actor: userId,
    endpoint: `/api/orders/st/${id}/status`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });

  let result;
  
  try {
    const order = await STOrder.findById(id);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    const listing = await STListing.findById(order.listingId);
    
    // Role checking
    if (status === "completed" && order.sellerId !== userId) {
      throw new ApiError(403, "Only the seller can mark order as completed");
    }

    // Validate status transition using the model's method
    try {
      await order.updateStatus(status, userId, note || cancelReason);
      await order.save();
    } catch (error) {
      throw new ApiError(400, error.message);
    }

    if (listing) {
      if (status === "completed") {
        listing.status = "sold";
      } else if (status === "cancelled") {
        if (cancelReason === "mutual" || cancelReason === "timeout") {
          listing.status = "active";
          listing.acceptedRequestId = null;
          listing.lockedByOrderId = null;
        } else {
          listing.status = "needs_review";
        }
      }
      // disputed leaves listing in pending_completion state
      await listing.save();
    }
    
    result = order;
  } catch (error) {
    throw error;
  }

  const responseBody = new ApiResponse(200, result, `Order ${status} successfully`);
  
  idempRecord.responseStatus = 200;
  idempRecord.responseBody = responseBody;
  await idempRecord.save();

  res.json(responseBody);
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

// Optional: Keep old buy-now for backward compatibility, but redirect to requestItem
export const createSTOrder = asyncHandler(async (req, res) => {
  // Redirect to requestItem
  return requestItem(req, res);
});