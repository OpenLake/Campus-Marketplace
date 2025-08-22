import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [
      {
        listing: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Listing",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Methods
wishlistSchema.methods.addItem = function (listingId) {
  const existingItem = this.items.find(
    (item) => item.listing.toString() === listingId.toString()
  );

  if (!existingItem) {
    this.items.push({ listing: listingId });
    return this.save();
  }
  return this;
};

wishlistSchema.methods.removeItem = function (listingId) {
  this.items = this.items.filter(
    (item) => item.listing.toString() !== listingId.toString()
  );
  return this.save();
};

wishlistSchema.methods.hasItem = function (listingId) {
  return this.items.some(
    (item) => item.listing.toString() === listingId.toString()
  );
};

// Static Methods
wishlistSchema.statics.getUserWishlist = function (userId) {
  return this.findOne({ user: userId }).populate("items.listing");
};

wishlistSchema.statics.createUserWishlist = function (userId) {
  return this.create({ user: userId, items: [] });
};

// Indexes
wishlistSchema.index({ user: 1 }, { unique: true });
wishlistSchema.index({ "items.listing": 1 });

export default mongoose.model("Wishlist", wishlistSchema);
