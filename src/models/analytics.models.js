import mongoose from "mongoose";

const METRIC_TYPES = [
  "user_registration",
  "listing_creation",
  "order_placed",
  "order_completed",
  "review_submitted",
];

const analyticsSchema = new mongoose.Schema(
  {
    metricType: {
      type: String,
      enum: METRIC_TYPES,
      required: true,
      index: true,
    },
    value: {
      type: Number,
      required: true,
      default: 1,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    entityType: {
      type: String,
      enum: ["User", "Listing", "Order", "Review"],
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

// TTL index - keep analytics data for 1 year
analyticsSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 365 * 24 * 60 * 60 }
);

// Simple indexes
analyticsSchema.index({ metricType: 1, date: -1 });
analyticsSchema.index({ userId: 1, metricType: 1 });
analyticsSchema.index({ entityType: 1, entityId: 1 });

// Static Methods
analyticsSchema.statics.recordMetric = function (metricType, options = {}) {
  const metric = new this({
    metricType,
    value: options.value || 1,
    date: options.date || new Date(),
    userId: options.userId,
    entityType: options.entityType,
    entityId: options.entityId,
  });

  return metric.save();
};

analyticsSchema.statics.getBasicStats = function (startDate, endDate) {
  const match = {};
  if (startDate && endDate) {
    match.date = { $gte: startDate, $lte: endDate };
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$metricType",
        total: { $sum: "$value" },
        count: { $sum: 1 },
      },
    },
  ]);
};

export default mongoose.model("Analytics", analyticsSchema);
