import jwt from "jsonwebtoken";
import { getPool } from "../db/pgConnect.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { findUserById } from "../models/users.model.js"; // add this import

 

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Defensive check for req.cookies
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request!!");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // decodedToken contains { user_id, role } (from googleAuth.controller.js)
    const user = await findUserById(decodedToken.user_id);

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    // Transform PostgreSQL user to match expected frontend/user object
    // - Convert role string to roles array
    // - Map user_id to _id for compatibility
    req.user = {
      _id: user.user_id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      role: user.role,
      roles: [user.role], // array for role checks
      is_verified: user.is_verified,
      avatar: user.avatar,
      google_id: user.google_id,
      created_at: user.created_at,
    };

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

// Role verification helpers (unchanged, now work with req.user.roles array)
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

  // User can only access their own resources (compare with _id)
  if (req.user._id.toString() === id) {
    return next();
  }

  throw new ApiError(403, "You can only access your own resources");
});

// For other resources (listings, orders, etc.) you'll need to adapt
// the corresponding models to PostgreSQL. The following middlewares
// are placeholders – you must replace MongoDB model imports with
// PostgreSQL queries if you intend to use them.

// Middleware to check if user owns a listing or is admin
export const verifyListingOwnershipOrAdmin = asyncHandler(
  async (req, res, next) => {
    const { id } = req.params;

    if (!req.user) {
      throw new ApiError(401, "Unauthorized request");
    }

    if (req.user.roles.includes("admin") || req.user.roles.includes("moderator")) {
      return next();
    }

    // TODO: Replace with PostgreSQL query for listings
    // const listing = await findListingById(id);
    // if (!listing) throw new ApiError(404, "Listing not found");
    // if (listing.owner_id === req.user._id) return next();

    throw new ApiError(403, "You can only access your own listings");
  }
);

// Similarly adapt other ownership middlewares as needed...

// Rate limiting and optionalAuth remain unchanged (but rate limiter may need user._id)
export const createRateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const userId = req.user?._id?.toString();
    if (!userId) return next();

    const now = Date.now();
    const userRequests = requests.get(userId) || [];

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

// Optional authentication (no error if token missing/invalid)
export const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next();
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await findUserById(decodedToken.user_id);

    if (user) {
      req.user = {
        _id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        role: user.role,
        roles: [user.role],
        is_verified: user.is_verified,
        avatar: user.avatar,
        google_id: user.google_id,
        created_at: user.created_at,
      };
    }

    next();
  } catch (error) {
    next(); // proceed without user
  }
});