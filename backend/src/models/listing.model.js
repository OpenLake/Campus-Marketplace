import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const CATEGORIES = [
  "books",
  "electronics",
  "cycle",
  "hostel-item",
  "clothing",
  "stationery",
  "food",
  "other",
];

const CONDITIONS = ["new", "like-new", "good", "fair", "poor"];
const LISTING_STATUS = ["active", "sold", "reserved", "expired", "banned"];

const priceHistorySchema = new mongoose.Schema(
  {
    price: { type: Number, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"User",
    }
  },
  { _id: false }
);

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title cannot exceed 100 characters"],
      index: "text",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [10, "Description must be at least 10 characters long"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      index: "text",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      max: [1000000, "Price cannot exceed 10 lakhs"],
    },
    originalPrice: {
      type: Number,
      min: [0, "Original price cannot be negative"],
    },
    priceHistory: [priceHistorySchema],
    negotiable: {
      type: Boolean,
      default: true,
    },
    images: {
      type: [
        {
          url: { type: String, required: true },
          publicId: { type: String }, // Cloudinary public ID
          isPrimary: { type: Boolean, default: false },
        },
      ],
      validate: {
        validator: function (v) {
          return v && v.length > 0 && v.length <= 10;
        },
        message: "Must have at least 1 and at most 10 images",
      },
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, "Category is required"],
      index: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    condition: {
      type: String,
      enum: CONDITIONS,
      default: "good",
      required: true,
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [50, "Brand name cannot exceed 50 characters"],
    },
    model: {
      type: String,
      trim: true,
      maxlength: [50, "Model name cannot exceed 50 characters"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: LISTING_STATUS,
      default: "active",
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
    location: {
      hostel: {
        type: String,
        enum: ["kanhar", "Gopad", "Indravati", "Shivnath"],
        required: true,
      },
      pickupPoint: {
        type: String,
        trim: true,
      },
      deliveryAvailable: {
        type: Boolean,
        default: false,
      },
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [20, "Tag cannot exceed 20 characters"],
      },
    ],
    views: {
      total: { type: Number, default: 0 },
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    soldTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    soldAt: {
      type: Date,
    },
    soldPrice: {
      type: Number,
    },
    expiresAt: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
      },
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
listingSchema.virtual("isExpired").get(function () {
  return this.expiresAt < new Date();
});

listingSchema.virtual("daysLeft").get(function () {
  const msLeft = this.expiresAt - new Date();
  return Math.ceil(msLeft / (1000 * 60 * 60 * 24));
});

listingSchema.virtual("discountPercentage").get(function () {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round(
    ((this.originalPrice - this.price) / this.originalPrice) * 100
  );
});

listingSchema.virtual("likesCount").get(function () {
  return this.likes ? this.likes.length : 0;
});

listingSchema.virtual("primaryImage").get(function () {
  if (!this.images || this.images.length === 0) return null;
  const primary = this.images.find((img) => img.isPrimary);
  return primary ? primary.url : this.images[0].url;
});

// Middleware
listingSchema.pre("save", function (next) {
  // Add initial price to history
  if (this.isNew) {
    this.priceHistory.push({
      price: this.price,
      reason: "initial",
    });

    // Set primary image if none set
    if (
      this.images &&
      this.images.length > 0 &&
      !this.images.some((img) => img.isPrimary)
    ) {
      this.images[0].isPrimary = true;
    }
  }

  // Track price changes
  if (this.isModified("price") && !this.isNew) {
    const lastPrice = this.priceHistory[this.priceHistory.length - 1]?.price;
    if (lastPrice !== this.price) {
      const reason = this.price < lastPrice ? "price_drop" : "price_increase";
      this.priceHistory.push({
        price: this.price,
        reason,
      });
    }
  }

  next();
});

// Methods
listingSchema.methods.addView = function (userId, source = "direct") {
  this.views.total += 1;

  // Track unique views
  const existingView = this.views.recent.find(
    (v) => v.user && v.user.toString() === userId?.toString()
  );

  if (!existingView) {
    this.views.unique += 1;
    this.views.recent.push({ user: userId, source });

    // Keep only last 100 recent views
    if (this.views.recent.length > 100) {
      this.views.recent = this.views.recent.slice(-100);
    }
  }

  return this.save();
};

listingSchema.methods.toggleLike = function (userId) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
    return false; // unliked
  } else {
    this.likes.push(userId);
    return true; // liked
  }
};

listingSchema.methods.addWatcher = function (userId) {
  const existing = this.watchers.find(
    (w) => w.user.toString() === userId.toString()
  );
  if (!existing) {
    this.watchers.push({ user: userId });
  }
};

listingSchema.methods.removeWatcher = function (userId) {
  this.watchers = this.watchers.filter(
    (w) => w.user.toString() !== userId.toString()
  );
};

listingSchema.methods.markAsSold = function (buyerId, soldPrice) {
  this.status = "sold";
  this.isAvailable = false;
  this.soldTo = buyerId;
  this.soldAt = new Date();
  this.soldPrice = soldPrice || this.price;
  return this.save();
};

listingSchema.methods.boost = function (boostType, duration = 7) {
  const expiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);

  this.boostHistory.push({
    boostType,
    expiresAt,
  });

  if (boostType === "featured") {
    this.isFeatured = true;
  } else if (boostType === "urgent") {
    this.isUrgent = true;
  }

  return this.save();
};

listingSchema.methods.bump = function () {
  const now = new Date();
  const lastBump = this.lastBumpedAt;

  // Allow bump only once per day
  if (!lastBump || now - lastBump >= 24 * 60 * 60 * 1000) {
    this.lastBumpedAt = now;
    return this.save();
  }

  throw new Error("Can only bump once per day");
};

// Static methods
listingSchema.statics.getPopularTags = function () {
  return this.aggregate([
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);
};

listingSchema.statics.getTrendingListings = function (limit = 10) {
  return this.find({
    status: "active",
    isAvailable: true,
  })
    .sort({ "views.total": -1, createdAt: -1 })
    .limit(limit)
    .populate("owner", "name username profileImage trustScore");
};

// Indexes
listingSchema.index({ title: "text", description: "text", tags: "text" });
listingSchema.index({ category: 1, status: 1, isAvailable: 1 });
listingSchema.index({ owner: 1, status: 1 });
listingSchema.index({ price: 1, category: 1 });
listingSchema.index({ createdAt: -1, isFeatured: -1 });
listingSchema.index({ "location.hostel": 1, category: 1 });
listingSchema.index({ "views.total": -1 });
listingSchema.index({ likes: 1 });
listingSchema.index({ expiresAt: 1 });

listingSchema.plugin(mongoosePaginate);

export const Listing = mongoose.model("Listing", listingSchema);
