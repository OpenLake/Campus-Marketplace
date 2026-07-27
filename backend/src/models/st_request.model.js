import mongoose from "mongoose";

const stRequestSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "STListing",
    required: true,
    index: true
  },

  sellerId: {
    type: String,
    required: true,
    index: true // Postgres UUID
  },

  buyerId: {
    type: String,
    required: true,
    index: true // Postgres UUID
  },

  // The "bid"
  offeredPrice: {
    type: Number,
    required: true,
    min: 0
  },

  message: {
    type: String,
    required: true,
    maxLength: 500
  },

  // Buyer can attach photos (e.g. proof of cash, trade-in item)
  buyerImages: [{
    url: String,
    publicId: String
  }],

  sellerMessage: {
    type: String,
    maxLength: 500
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "withdrawn"],
    default: "pending"
  }
}, {
  timestamps: true,
  collection: "st_requests"
});

// One active request per buyer per listing — no spamming, but allow new request after withdrawal/rejection
stRequestSchema.index(
  { listingId: 1, buyerId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" }
  }
);
stRequestSchema.index({ listingId: 1, status: 1 });
stRequestSchema.index({ sellerId: 1, status: 1, createdAt: -1 });

// Auto-update listing counters after every request save
stRequestSchema.post("save", async function () {
  const STListing = mongoose.model("STListing");
  const stats = await this.constructor.aggregate([
    { $match: { listingId: this.listingId, status: "pending" } },
    {
      $group: {
        _id: "$listingId",
        count: { $sum: 1 },
        max: { $max: "$offeredPrice" }
      }
    }
  ]);

  if (stats.length > 0) {
    await STListing.findByIdAndUpdate(this.listingId, {
      requestCount: stats[0].count,
      highestOffer: stats[0].max
    });
  } else {
    // No pending requests
    await STListing.findByIdAndUpdate(this.listingId, {
      requestCount: 0,
      highestOffer: 0
    });
  }
});

export const STRequest = mongoose.model("STRequest", stRequestSchema);