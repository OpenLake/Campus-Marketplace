import mongoose from "mongoose";

const ACTIVITY_TYPES = [
  "listing_created",
  "listing_sold",
  "order_placed",
  "order_completed",
  "review_given",
  "user_registered",
  "vendor_created",
];

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    activityType: {
      type: String,
      enum: ACTIVITY_TYPES,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 200,
    },
    entityType: {
      type: String,
      enum: ["User", "Listing", "Order", "Vendor", "Review"],
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index - automatically delete logs older than 6 months
activityLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 6 * 30 * 24 * 60 * 60 }
);

// Simple indexes
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ activityType: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });

// Static Methods
activityLogSchema.statics.logActivity = function (
  userId,
  activityType,
  description,
  options = {}
) {
  const activity = new this({
    user: userId,
    activityType,
    description,
    entityType: options.entityType,
    entityId: options.entityId,
  });

  return activity.save();
};

activityLogSchema.statics.getUserActivities = function (userId, limit = 20) {
  return this.find({ user: userId }).sort({ createdAt: -1 }).limit(limit);
};

export default mongoose.model("ActivityLog", activityLogSchema);
