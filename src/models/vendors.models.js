import mongoose from "mongoose";

const VENDOR_TYPES = ["individual", "club", "organization", "external"];
const VENDOR_STATUS = [
  "pending",
  "approved",
  "suspended",
  "rejected",
  "inactive",
];
const BUSINESS_CATEGORIES = [
  "food_beverages",
  "electronics",
  "books_stationery",
  "clothing_accessories",
  "other",
];

const businessHoursSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      required: true,
    },
    isOpen: { type: Boolean, default: true },
    openTime: { type: String }, // "09:00"
    closeTime: { type: String }, // "18:00"
    breaks: [
      {
        startTime: { type: String },
        endTime: { type: String },
      },
    ],
  },
  { _id: false }
);

const verificationDocSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "gst_certificate",
        "business_license",
        "id_proof",
        "other",
      ],
      required: true,
    },
    documentUrl: { type: String, required: true },
    documentNumber: { type: String },
    issuedDate: { type: Date },
    expiryDate: { type: Date },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },
  },
  { _id: false }
);

const salesMetricsSchema = new mongoose.Schema(
  {
    totalOrders: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    fulfillmentRate: { type: Number, default: 0 }, // percentage
  },
  { _id: false }
);

const vendorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    vendorType: {
      type: String,
      enum: VENDOR_TYPES,
      default: "individual",
    },
    businessInfo: {
      shopName: {
        type: String,
        required: true,
        trim: true,
        minlength: [2, "Shop name must be at least 2 characters"],
        maxlength: [100, "Shop name cannot exceed 100 characters"],
      },
      displayName: {
        type: String,
        trim: true,
        maxlength: [100, "Display name cannot exceed 100 characters"],
      },
      description: {
        type: String,
        trim: true,
        maxlength: [1000, "Description cannot exceed 1000 characters"],
        index: "text",
      },
      tagline: {
        type: String,
        trim: true,
        maxlength: [100, "Tagline cannot exceed 100 characters"],
      },
      logo: {
        url: { type: String },
        publicId: { type: String },
      },
      coverImage: {
        url: { type: String },
        publicId: { type: String },
      },
    },
    categories: [
      {
        type: String,
        enum: BUSINESS_CATEGORIES,
      },
    ],
    location: {
      address: {
        type: String,
        trim: true,
        maxlength: [200, "Address cannot exceed 200 characters"],
      },
      operatingAreas: [{ type: String }],
    },
    contactInfo: {
      phone: {
        type: String,
        required: true,
        match: [
          /^(\+91|91)?[6-9]\d{9}$/,
          "Please enter a valid Indian phone number",
        ],
      },
      email: { type: String, lowercase: true, trim: true },
    },
    businessHours: [businessHoursSchema],
    specialHours: [
      {
        date: { type: Date, required: true },
        isOpen: { type: Boolean, default: false },
        openTime: { type: String },
        closeTime: { type: String },
        reason: { type: String }, // "Holiday", "Special Event", etc.
      },
    ],
    status: {
      type: String,
      enum: VENDOR_STATUS,
      default: "pending",
      index: true,
    },
    approvalInfo: {
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      approvedAt: { type: Date },
      rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rejectedAt: { type: Date },
      rejectionReason: { type: String },
      reviewNotes: { type: String },
    },
    verificationDocs: [verificationDocSchema],
    subscription: {
      plan: {
        type: String,
        enum: ["free", "basic", "premium"],
        default: "free",
      },
      validUntil: { type: Date },
    },
    ratings: {
      overall: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    salesMetrics: salesMetricsSchema,
    badges: [
      {
        type: String,
        enum: ["verified", "top_rated", "trusted_seller"],
        awardedAt: { type: Date, default: Date.now },
      },
    ],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
vendorSchema.virtual("isVerified").get(function () {
  return this.status === "approved";
});

vendorSchema.virtual("averageRating").get(function () {
  return this.ratings.overall;
});

vendorSchema.virtual("totalFollowers").get(function () {
  return this.followers ? this.followers.length : 0;
});

// Middleware - simplified
vendorSchema.pre("save", function (next) {
  next();
});

// Methods
vendorSchema.methods.approve = function (approvedBy, notes) {
  this.status = "approved";
  this.approvalInfo.approvedBy = approvedBy;
  this.approvalInfo.approvedAt = new Date();
  this.approvalInfo.reviewNotes = notes;

  return this.save();
};

vendorSchema.methods.reject = function (rejectedBy, reason) {
  this.status = "rejected";
  this.approvalInfo.rejectedBy = rejectedBy;
  this.approvalInfo.rejectedAt = new Date();
  this.approvalInfo.rejectionReason = reason;

  return this.save();
};

vendorSchema.methods.suspend = function (reason) {
  this.status = "suspended";
  this.approvalInfo.rejectionReason = reason;

  return this.save();
};

vendorSchema.methods.addFollower = function (userId) {
  if (!this.followers.includes(userId)) {
    this.followers.push(userId);
  }
  return this.save();
};

vendorSchema.methods.removeFollower = function (userId) {
  this.followers = this.followers.filter(
    (id) => id.toString() !== userId.toString()
  );
  return this.save();
};

vendorSchema.methods.updateRating = function (newRating) {
  const totalRating = this.ratings.overall * this.ratings.count + newRating;
  this.ratings.count++;
  this.ratings.overall = totalRating / this.ratings.count;
  this.ratings.overall = Math.round(this.ratings.overall * 10) / 10;
  return this.save();
};

vendorSchema.methods.updateSalesMetrics = function (orderData) {
  this.salesMetrics.totalOrders++;

  if (orderData.status === "completed") {
    this.salesMetrics.completedOrders++;
    this.salesMetrics.totalRevenue += orderData.amount;
  }

  this.salesMetrics.fulfillmentRate =
    (this.salesMetrics.completedOrders / this.salesMetrics.totalOrders) * 100;

  return this.save();
};

vendorSchema.methods.awardBadge = function (badgeType) {
  if (!this.badges.some((b) => b.type === badgeType)) {
    this.badges.push({ type: badgeType });
  }
  return this.save();
};

// Static Methods
vendorSchema.statics.findByCategory = function (category, options = {}) {
  const query = {
    categories: category,
    status: "approved",
  };

  return this.find(query)
    .populate("user", "name username")
    .sort(options.sort || { "ratings.overall": -1 })
    .limit(options.limit || 20);
};

vendorSchema.statics.getTopRated = function (limit = 10) {
  return this.find({ status: "approved" })
    .sort({ "ratings.overall": -1, "ratings.count": -1 })
    .limit(limit)
    .populate("user", "name username");
};

// Indexes
vendorSchema.index({ user: 1 });
vendorSchema.index({ status: 1 });
vendorSchema.index({ categories: 1, status: 1 });
vendorSchema.index({ "ratings.overall": -1 });
vendorSchema.index({ "businessInfo.shopName": "text" });

export default mongoose.model("Vendor", vendorSchema);
