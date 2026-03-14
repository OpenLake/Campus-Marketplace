import mongoose from "mongoose";

const stListingSchema = new mongoose.Schema({
  sellerId: { type: String, required: true, index: true }, // PostgreSQL UUID

  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  basePrice: { type: Number, required: true, min: 0 },
  condition: { type: String, enum: ["new", "like_new", "good", "fair"], required: true },

  category: { type: mongoose.Schema.Types.ObjectId, ref: "STCategory", required: true, index: true },

  images: [{
    url: { type: String, required: true },
    publicId: String,
    isCover: { type: Boolean, default: false }
  }],

  // Polling aggregates – auto‑updated via middleware
  interestCount: { type: Number, default: 0 },
  highestOffer: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ["active", "pending_completion", "sold", "archived"],
    default: "active"
  }
}, { timestamps: true });

stListingSchema.index({ category: 1, status: 1 });
stListingSchema.index({ sellerId: 1, status: 1 });

export const STListing = mongoose.model("STListing", stListingSchema);