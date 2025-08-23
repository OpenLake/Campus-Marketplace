// Core Models
export { User } from "./users.model.js";
export { default as Listing } from "./listing.model.js";
export { default as Order } from "./order.model.js";
export { default as Review } from "./reviews.model.js";
export { default as Vendor } from "./vendors.model.js";
export { default as Chat } from "./chat.model.js";
export { default as Notification } from "./notification.model.js";

// Utility Models
export { default as Wishlist } from "./wishlist.model.js";
export { default as ActivityLog } from "./activityLog.models.js";
export { default as Report } from "./report.model.js";
export { default as Analytics } from "./analytics.model.js";
export { default as Settings } from "./settings.model.js";

// Model constants
export const HOSTELS = ["kanhar", "Gopad", "Indravati", "Shivnath"];

export const DEPARTMENTS = [
  "CSE",
  "ECE",
  "ME",
  "EE",
  "MSME",
  "DSAI",
];

export const LISTING_CATEGORIES = [
  "books",
  "electronics",
  "cycle",
  "hostel-item",
  "clothing",
  "stationery",
  "sports",
  "food",
  "other",
];
