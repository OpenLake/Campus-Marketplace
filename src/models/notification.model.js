import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

//Send updates (order status, new listing, etc.).
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["order", "listing", "system"],
      required: true,
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedId: { type: mongoose.Schema.Types.ObjectId }, // orderId, listingId, etc.
  },
  { timestamps: true }
);

notificationSchema.plugin(mongoosePaginate);

export const Notification = mongoose.model("Notification", notificationSchema);
