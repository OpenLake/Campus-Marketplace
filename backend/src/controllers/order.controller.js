import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { Order } from "../models/order.model.js";
import { Listing } from "../models/listing.model.js";
import mongoose from "mongoose";

// Create a new order
export const createOrder = asyncHandler(async (req, res) => {
    const { items, address, paymentStatus } = req.body;

    if (!items || items.length === 0) {
        throw new ApiError(400, "No items in order");
    }

    // 1. Validate Items & Calculate Total
    let totalAmount = 0;
    const orderItems = [];
    const sellerId = items[0].listing.owner || items[0].owner; // Assuming items grouped by seller for MVP or single seller check needed

    // Check if multiple sellers (MVP restriction: 1 seller per order usually simpler, but let's assume Cart handles grouping)
    // For now, let's validate that all items exist and are available
    for (const item of items) {
        const listing = await Listing.findById(item.listing).populate("owner");
        if (!listing) {
            throw new ApiError(404, `Listing not found: ${item.listing}`);
        }
        if (!listing.isAvailable || listing.status !== "active") {
            throw new ApiError(400, `Item ${listing.title} is not available`);
        }

        // Logic: If user is buying their own item
        if (listing.owner._id.toString() === req.user._id.toString()) {
            throw new ApiError(400, "You cannot buy your own item");
        }

        orderItems.push({
            listing: listing._id,
            quantity: item.quantity || 1,
            price: listing.price,
        });
        totalAmount += listing.price * (item.quantity || 1);
    }

    // 2. Create Order
    const order = await Order.create({
        buyer: req.user._id,
        seller: sellerId, // Note: This assumes single seller per order for this implementation phase
        items: orderItems,
        totalAmount,
        address,
        paymentStatus: paymentStatus || "pending",
    });

    // 3. Update Listing Status (Mark as Sold if quantity logic permits, or just standard flow)
    // For unique items (cycles), mark as Sold immediately if payment is not required gate
    // For MVP, we might keep it active until "Delivered" or payment confirmed.

    return res
        .status(201)
        .json(new ApiResponse(201, order, "Order placed successfully"));
});

// Get My Orders (As Buyer)
export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ buyer: req.user._id })
        .populate("items.listing", "title images price")
        .populate("seller", "name username email")
        .sort("-createdAt");

    return res
        .status(200)
        .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

// Get My Sales (As Seller)
export const getMySales = asyncHandler(async (req, res) => {
    // Find orders where the current user is the seller
    // Note: Since our Order model has a top-level 'seller' field, this is easy.
    // If mixed carts were allowed, we'd need to query inside items.listing.owner

    // Since we populated seller in createOrder (assumed), we query directly.
    // But wait, in createOrder I assumed 'sellerId' from first item. 
    // Let's refine: For this MVP, we fetch orders where 'seller' is the user.

    const sales = await Order.find({ seller: req.user._id })
        .populate("items.listing", "title images price")
        .populate("buyer", "name username email hostelLocation")
        .sort("-createdAt");

    return res
        .status(200)
        .json(new ApiResponse(200, sales, "Sales history fetched successfully"));
});

// Get Order By ID
export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate("items.listing", "title images price")
        .populate("buyer", "name email phone hostelLocation")
        .populate("seller", "name email phone");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Auth Check: Only Buyer, Seller, or Admin can view
    const isBuyer = order.buyer._id.toString() === req.user._id.toString();
    const isSeller = order.seller._id.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes("admin");

    if (!isBuyer && !isSeller && !isAdmin) {
        throw new ApiError(403, "Unauthorized to view this order");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order details fetched successfully"));
});

// Update Order Status (Seller Only)
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body; // 'delivered', 'in-progress'

    const order = await Order.findById(req.params.id);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Only Seller or Admin can update status
    if (order.seller.toString() !== req.user._id.toString() && !req.user.roles.includes("admin")) {
        throw new ApiError(403, "Unauthorized to update order status");
    }

    order.deliveryStatus = status;

    // If Delivered, mark listings as sold?
    if (status === "delivered") {
        order.paymentStatus = "completed"; // Assume COP (Cash on Pickup) or Pre-paid

        // Mark items as sold
        for (const item of order.items) {
            await Listing.findByIdAndUpdate(item.listing, { isAvailable: false, status: 'sold' });
        }
    }

    await order.save();

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order status updated successfully"));
});
