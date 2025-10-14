import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const REPORT_TYPES = [
  "inappropriate_content",
  "spam",
  "fraud",
  "harassment",
  "fake_listing",
  "other",
];

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reportedItem: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    reportedItemType: {
      type: String,
      enum: ["Listing", "User", "Review"],
      required: true,
    },
    type: {
      type: String,
      enum: REPORT_TYPES,
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    resolution: {
      type: String,
      maxlength: [300, "Resolution cannot exceed 300 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Methods
reportSchema.methods.markAsReviewed = function (reviewerId, resolution) {
  this.status = "reviewed";
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  this.resolution = resolution;
  return this.save();
};

reportSchema.methods.resolve = function (resolution) {
  this.status = "resolved";
  this.resolution = resolution;
  return this.save();
};

reportSchema.methods.dismiss = function (reason) {
  this.status = "dismissed";
  this.resolution = reason;
  return this.save();
};

// Static Methods
reportSchema.statics.getPendingReports = function () {
  return this.find({ status: "pending" })
    .populate("reporter", "name username")
    .sort({ createdAt: -1 });
};

reportSchema.statics.getReportsByType = function (type) {
  return this.find({ type }).sort({ createdAt: -1 });
};

reportSchema.statics.getReportsForItem = function (itemId, itemType) {
  return this.find({
    reportedItem: itemId,
    reportedItemType: itemType,
  }).sort({ createdAt: -1 });
};

// Indexes
reportSchema.index({ reportedItem: 1, reportedItemType: 1 });
reportSchema.index({ type: 1, status: 1 });
reportSchema.index({ createdAt: -1 });

reportSchema.plugin(mongoosePaginate);

export const Report = mongoose.model("Report", reportSchema);
