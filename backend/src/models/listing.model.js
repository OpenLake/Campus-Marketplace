import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const listingSchema = new mongoose.Schema({
  // Seller reference (PostgreSQL UUID)
  sellerId: {
    type: String,
    required: true,
    index: true
  },
  
  // Basic info
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    minlength: [5, "Title must be at least 5 characters"],
    maxlength: [100, "Title cannot exceed 100 characters"]
  },
  
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
    minlength: [20, "Description must be at least 20 characters"],
    maxlength: [2000, "Description cannot exceed 2000 characters"]
  },
  
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
    max: [1000000, "Price cannot exceed ₹10,00,000"]
  },
  
  // Category - you can expand this list
  category: {
    type: String,
    required: [true, "Category is required"],
    enum: {
      values: [
        "books",
        "electronics",
        "furniture", 
        "clothing",
        "sports",
        "stationery",
        "vehicles",
        "instruments",
        "games",
        "others"
      ],
      message: "{VALUE} is not a valid category"
    }
  },
  
  // Condition of item
  condition: {
    type: String,
    required: [true, "Condition is required"],
    enum: {
      values: [
        "new",           // Brand new, unused
        "like-new",      // Used but looks like new
        "good",          // Used but in good condition
        "fair",          // Used with visible wear
        "poor"           // Used but functional
      ],
      message: "{VALUE} is not a valid condition"
    }
  },
  
  // Images
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,  // For cloud storage (Cloudinary, etc.)
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Location (within campus)
  location: {
    hostel: {
      type: String,
      enum: ["BH-1", "BH-2", "BH-3", "GH-1", "Off-Campus", "Other"]
    },
    roomNumber: String,
    landmark: String
  },
  
  // Negotiation settings
  isNegotiable: {
    type: Boolean,
    default: false
  },
  
  // Status flags
  isActive: {
    type: Boolean,
    default: true
  },
  
  isSold: {
    type: Boolean,
    default: false
  },
  
  soldAt: Date,
  
  // Stats
  views: {
    type: Number,
    default: 0
  },
  
  saves: {
    type: Number,
    default: 0
  },
  
  // Additional details (flexible fields)
  details: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
  
}, {
  timestamps: true,  // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if item is available
listingSchema.virtual('available').get(function() {
  return this.isActive && !this.isSold;
});

// Text index for search
listingSchema.index({ 
  title: "text", 
  description: "text",
  category: "text"
});

// Compound indexes for common queries
listingSchema.index({ sellerId: 1, createdAt: -1 });
listingSchema.index({ category: 1, price: 1 });
listingSchema.index({ isActive: 1, isSold: 1, createdAt: -1 });
listingSchema.index({ price: 1, condition: 1 });

// Add pagination plugin
listingSchema.plugin(mongoosePaginate);

// Pre-save middleware
listingSchema.pre('save', function(next) {
  // Ensure only one primary image
  if (this.images && this.images.length > 0) {
    const hasPrimary = this.images.some(img => img.isPrimary);
    if (!hasPrimary) {
      this.images[0].isPrimary = true;
    }
  }
  next();
});

// Instance methods
listingSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

listingSchema.methods.markAsSold = function() {
  this.isSold = true;
  this.isActive = false;
  this.soldAt = new Date();
  return this.save();
};

// Static methods
listingSchema.statics.findBySeller = function(sellerId, page = 1, limit = 10) {
  return this.find({ sellerId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

listingSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    isActive: true,
    isSold: false,
    ...filters
  };
  
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  return this.find(searchQuery).sort({ createdAt: -1 });
};

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;