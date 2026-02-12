// Core Models
export { User } from "./users.model.js";
export { Listing } from "./listing.model.js";
export { Order } from "./order.model.js";
export { Review } from "./reviews.model.js";
export { Vendor } from "./vendors.model.js";
export { Chat } from "./chat.model.js";
export { Notification } from "./notification.model.js";

// Utility Models
export { Wishlist } from "./wishlist.model.js";
export { default as ActivityLog } from "./activityLog.model.js";
export { Report } from "./report.model.js";
export { Analytics } from "./analytics.model.js";
export { default as Settings } from "./settings.model.js";

// Model constants
export const HOSTELS = ["kanhar", "Gopad", "Indravati", "Shivnath"];

export const DEPARTMENTS = ["CSE", "ECE", "ME", "EE", "MSME", "DSAI"];

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
