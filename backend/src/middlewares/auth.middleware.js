import jwt from "jsonwebtoken";
import { User } from "../models/users.model.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Defensive check for req.cookies
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request: No token found");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshTokens -verificationToken -resetPasswordToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized request");
    }

    const hasRole = allowedRoles.some((role) => req.user.roles.includes(role));

    if (!hasRole) {
      throw new ApiError(
        403,
        "You don't have permission to access this resource"
      );
    }

    next();
  };
};

export const verifyAdmin = verifyRoles("admin");
export const verifyModerator = verifyRoles("admin", "moderator");
export const verifyVendorAdmin = verifyRoles("admin", "vendor_admin");

// Middleware to check if user can access their own resources or admin can access any
export const verifyOwnershipOrAdmin = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!req.user) {
    throw new ApiError(401, "Unauthorized request");
  }

  // Admin can access any resource
  if (req.user.roles.includes("admin")) {
    return next();
  }

  // User can only access their own resources
  if (req.user._id.toString() === id) {
    return next();
  }

  throw new ApiError(403, "You can only access your own resources");
});

// Middleware to check if user owns a listing or is admin
export const verifyListingOwnershipOrAdmin = asyncHandler(
  async (req, res, next) => {
    const { id } = req.params;

    if (!req.user) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Admin or moderator can access any resource
    if (
      req.user.roles.includes("admin") ||
      req.user.roles.includes("moderator")
    ) {
      return next();
    }

    // Check if user owns the listing
    const { Listing } = await import("../models/listing.model.js");
    const listing = await Listing.findById(id);

    if (!listing) {
      throw new ApiError(404, "Listing not found");
    }

    if (listing.owner.toString() === req.user._id.toString()) {
      return next();
    }

    throw new ApiError(403, "You can only access your own listings");
  }
);

// Middleware to check if user is part of an order (buyer/seller) or admin
export const verifyOrderParticipantOrAdmin = asyncHandler(
  async (req, res, next) => {
    const { id } = req.params;

    if (!req.user) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Admin can access any resource
    if (req.user.roles.includes("admin")) {
      return next();
    }

    // Check if user is buyer or seller of the order
    const Order = (await import("../models/order.model.js")).Order;
    const order = await Order.findById(id);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    const isParticipant =
      order.buyer.toString() === req.user._id.toString() ||
      order.seller.toString() === req.user._id.toString();

    if (isParticipant) {
      return next();
    }

    throw new ApiError(403, "You can only access orders you're involved in");
  }
);

// Middleware to check if user can access vendor profile
export const verifyVendorAccessOrAdmin = asyncHandler(
  async (req, res, next) => {
    const { id } = req.params;

    if (!req.user) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Admin can access any resource
    if (req.user.roles.includes("admin")) {
      return next();
    }

    // Check if user owns the vendor profile
    const Vendor = (await import("../models/vendors.model.js")).Vendor;
    const vendor = await Vendor.findById(id);

    if (!vendor) {
      throw new ApiError(404, "Vendor not found");
    }

    if (vendor.userId.toString() === req.user._id.toString()) {
      return next();
    }

    throw new ApiError(403, "You can only access your own vendor profile");
  }
);

// Middleware to check if user can access chat
export const verifyChatParticipantOrAdmin = asyncHandler(
  async (req, res, next) => {
    const { id } = req.params;

    if (!req.user) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Admin can access any resource
    if (req.user.roles.includes("admin")) {
      return next();
    }

    // Check if user is a participant in the chat
    const Chat = (await import("../models/chat.model.js")).Chat;
    const chat = await Chat.findById(id);

    if (!chat) {
      throw new ApiError(404, "Chat not found");
    }

    const isParticipant = chat.participants.some(
      (participant) => participant.toString() === req.user._id.toString()
    );

    if (isParticipant) {
      return next();
    }

    throw new ApiError(403, "You can only access chats you're part of");
  }
);

// Middleware to check if user owns a wishlist or it's public, or user is admin
export const verifyWishlistAccessOrAdmin = asyncHandler(
  async (req, res, next) => {
    const { id } = req.params;

    if (!req.user) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Admin can access any resource
    if (req.user.roles.includes("admin")) {
      return next();
    }

    // Check wishlist ownership or public status
    const Wishlist = (await import("../models/wishlist.model.js")).Wishlist;
    const wishlist = await Wishlist.findById(id);

    if (!wishlist) {
      throw new ApiError(404, "Wishlist not found");
    }

    // User can access if they own it or if it's public
    if (
      wishlist.userId.toString() === req.user._id.toString() ||
      wishlist.isPublic
    ) {
      return next();
    }

    throw new ApiError(
      403,
      "You can only access your own wishlists or public wishlists"
    );
  }
);

// Enhanced role verification with multiple conditions
export const verifyAnyRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized request");
    }

    const hasAnyRole = allowedRoles.some((role) =>
      req.user.roles.includes(role)
    );

    if (!hasAnyRole) {
      throw new ApiError(
        403,
        `You need one of these roles: ${allowedRoles.join(", ")}`
      );
    }

    next();
  };
};

// Middleware to check if user has all specified roles
export const verifyAllRoles = (...requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized request");
    }

    const hasAllRoles = requiredRoles.every((role) =>
      req.user.roles.includes(role)
    );

    if (!hasAllRoles) {
      throw new ApiError(
        403,
        `You need all these roles: ${requiredRoles.join(", ")}`
      );
    }

    next();
  };
};

// Rate limiting middleware (optional enhancement)
export const createRateLimiter = (
  maxRequests = 100,
  windowMs = 15 * 60 * 1000
) => {
  const requests = new Map();

  return (req, res, next) => {
    const userId = req.user?._id?.toString();
    if (!userId) return next();

    const now = Date.now();
    const userRequests = requests.get(userId) || [];

    // Remove requests older than the window
    const validRequests = userRequests.filter(
      (timestamp) => now - timestamp < windowMs
    );

    if (validRequests.length >= maxRequests) {
      throw new ApiError(429, "Too many requests. Please try again later.");
    }

    validRequests.push(now);
    requests.set(userId, validRequests);

    next();
  };
};

//Optional authentication middleware
export const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next(); // Proceed without authentication
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshTokens -verificationToken -resetPasswordToken"
    );

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Ignore errors and proceed without authentication
    next();
  }
});
