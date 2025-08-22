import mongoose from "mongoose";

const NOTIFICATION_TYPES = [
  "order_placed",
  "order_completed",
  "order_cancelled",
  "new_listing",
  "listing_sold",
  "review_received",
  "message_received",
];

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    message: {
      type: String,
      required: true,
      maxlength: [300, "Message cannot exceed 300 characters"],
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    relatedModel: {
      type: String,
      enum: ["Order", "Listing", "User", "Review"],
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Methods
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static Methods
notificationSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({ recipient: userId, isRead: false });
};

notificationSchema.statics.getRecentNotifications = function (
  userId,
  limit = 20
) {
  return this.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("sender", "name username");
};

notificationSchema.statics.markAllAsRead = function (userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ relatedId: 1, relatedModel: 1 });

export default mongoose.model("Notification", notificationSchema);
