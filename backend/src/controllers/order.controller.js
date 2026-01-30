import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { Order } from "../models/order.model.js";
import { Listing } from "../models/listing.model.js";

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