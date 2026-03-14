import mongoose from "mongoose";

const stInterestSchema = new mongoose.Schema({
  listingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Listing", 
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

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "withdrawn"],
    default: "pending"
  }
}, { 
  timestamps: true,
  collection: "st_interests"
});

// One interest per buyer per listing — no spamming
stInterestSchema.index({ listingId: 1, buyerId: 1 }, { unique: true });
stInterestSchema.index({ listingId: 1, status: 1 });
stInterestSchema.index({ sellerId: 1, status: 1, createdAt: -1 });

// Auto-update listing counters after every interest save
stInterestSchema.post("save", async function() {
  const Listing = mongoose.model("Listing");
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
    await Listing.findByIdAndUpdate(this.listingId, {
      interestCount: stats[0].count,
      highestOffer: stats[0].max
    });
  } else {
    // No pending interests
    await Listing.findByIdAndUpdate(this.listingId, {
      interestCount: 0,
      highestOffer: 0
    });
  }
});

export const STInterest = mongoose.model("STInterest", stInterestSchema);