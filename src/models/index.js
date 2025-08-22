// Core Models
export { User } from "./users.models.js";
export { default as Listing } from "./listing.models.js";
export { default as Order } from "./order.models.js";
export { default as Review } from "./reviews.models.js";
export { default as Vendor } from "./vendors.models.js";
export { default as Chat } from "./chat.models.js";
export { default as Notification } from "./notification.models.js";

// Utility Models
export { default as Wishlist } from "./wishlist.models.js";
export { default as ActivityLog } from "./activityLog.models.js";
export { default as Report } from "./report.models.js";
export { default as Analytics } from "./analytics.models.js";
export { default as Settings } from "./settings.models.js";

// Model constants
export const HOSTELS = ["kanhar", "Gopad", "Indravati", "Shivnath"];

export const DEPARTMENTS = [
  "CSE",
  "ECE",
  "ME",
  "CE",
  "EEE",
  "MME",
  "DSAI",
  "BT",
  "CHE",
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
