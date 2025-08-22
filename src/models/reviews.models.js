import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      index: true,
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Review title cannot exceed 100 characters"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, "Review comment cannot exceed 500 characters"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Methods
reviewSchema.methods.markHelpful = function () {
  this.helpful += 1;
  return this.save();
};

reviewSchema.methods.hide = function () {
  this.isActive = false;
  return this.save();
};

// Static Methods
reviewSchema.statics.getAverageRating = function (
  targetId,
  targetType = "listing"
) {
  const matchField = targetType === "listing" ? "listing" : "reviewee";

  return this.aggregate([
    {
      $match: {
        [matchField]: targetId,
        isActive: true,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);
};

reviewSchema.statics.getReviewsForListing = function (listingId, limit = 10) {
  return this.find({ listing: listingId, isActive: true })
    .populate("reviewer", "name username")
    .sort({ createdAt: -1 })
    .limit(limit);
};

reviewSchema.statics.getUserReviews = function (
  userId,
  type = "received",
  limit = 10
) {
  const field = type === "received" ? "reviewee" : "reviewer";
  return this.find({ [field]: userId, isActive: true })
    .populate(type === "received" ? "reviewer" : "reviewee", "name username")
    .populate("listing", "title")
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Indexes
reviewSchema.index({ reviewer: 1, listing: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1, isActive: 1 });
reviewSchema.index({ listing: 1, isActive: 1, rating: -1 });
reviewSchema.index({ order: 1 }, { sparse: true });
reviewSchema.index({ createdAt: -1 });

export default mongoose.model("Review", reviewSchema);
