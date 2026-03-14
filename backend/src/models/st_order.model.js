import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const stOrderSchema = new mongoose.Schema(
  {
    // 🔹 NEW: Link to the interest that created this order
    interestId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "STInterest", // source of this order
      index: true 
    },
    
    // References to PostgreSQL users (storing as strings since they're UUIDs)
    buyerId: { 
      type: String, 
      required: true,
      index: true 
    },
    sellerId: { 
      type: String, 
      required: true,
      index: true 
    },
    
    // Reference to the listing in MongoDB
    listingId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Listing", 
      required: true,
      index: true 
    },
    
    // 🔹 UPDATED: Order details (simplified)
    orderNumber: {
      type: String,
      unique: true,
      required: true
    },
    
    // 🔹 UPDATED: Use finalPrice instead of priceAtPurchase + quantity
    finalPrice: { 
      type: Number, 
      required: true,
      min: 0 
    },
    
    // 🔹 REMOVED: quantity, priceAtPurchase, totalAmount (now in interest)
    // quantity and priceAtPurchase are now stored in the interest document
    
    // 🔹 UPDATED: Status enum for order-only states
    status: { 
      type: String, 
      enum: [
        "awaiting_meetup",  // Order created, waiting for meetup
        "completed",         // Transaction completed successfully
        "cancelled",         // Order cancelled
        "disputed"           // Issue reported
      ], 
      default: "awaiting_meetup" 
    },
    
    // Status history for audit trail
    statusHistory: [{
      status: {
        type: String,
        enum: ["awaiting_meetup", "completed", "cancelled", "disputed"]
      },
      changedBy: {
        type: String, // User ID who changed the status
        required: true
      },
      changedAt: {
        type: Date,
        default: Date.now
      },
      note: String
    }],
    
    // Communication/meetup details
    meetupDetails: {
      location: String,
      meetupTime: Date,
      notes: String
    },
    
    // Payment tracking
    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
      default: "cash"
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"], // 🔹 UPDATED: simplified
      default: "unpaid"
    },
    
    // Timestamps
    completedAt: Date,
    cancelledAt: Date
  },
  { 
    timestamps: true, // This automatically adds createdAt and updatedAt
    collection: "st_orders"
  }
);

// 🔹 UPDATED: Generate order number before saving (simpler format)
stOrderSchema.pre("save", function(next) {
  if (!this.orderNumber) {
    const d = new Date();
    const stamp = `${d.getFullYear().toString().slice(-2)}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    this.orderNumber = `ST-${stamp}-${random}`;
  }
  next();
});

// Indexes for better query performance
stOrderSchema.index({ buyerId: 1, createdAt: -1 });
stOrderSchema.index({ sellerId: 1, status: 1, createdAt: -1 });
stOrderSchema.index({ listingId: 1, status: 1 });
stOrderSchema.index({ orderNumber: 1 });
stOrderSchema.index({ interestId: 1 }); // 🔹 NEW: index for interest lookup

// Add pagination plugin
stOrderSchema.plugin(mongoosePaginate);

// 🔹 UPDATED: Instance methods
stOrderSchema.methods.updateStatus = async function(newStatus, userId, note = "") {
  // Validate status transition
  const validTransitions = {
    awaiting_meetup: ["completed", "cancelled", "disputed"],
    completed: [],
    cancelled: [],
    disputed: ["completed", "cancelled"]
  };

  if (!validTransitions[this.status]?.includes(newStatus)) {
    throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
  }

  this.statusHistory.push({
    status: this.status,
    changedBy: userId,
    changedAt: new Date(),
    note: note
  });
  
  this.status = newStatus;
  
  // Update timestamp based on status
  if (newStatus === "completed") {
    this.completedAt = new Date();
  } else if (newStatus === "cancelled") {
    this.cancelledAt = new Date();
  }
  
  return this.save();
};

// 🔹 UPDATED: Static methods
stOrderSchema.statics.findActiveByBuyer = function(buyerId) {
  return this.find({
    buyerId,
    status: { $in: ["awaiting_meetup"] }
  }).sort({ createdAt: -1 });
};

stOrderSchema.statics.findActiveBySeller = function(sellerId) {
  return this.find({
    sellerId,
    status: { $in: ["awaiting_meetup"] }
  }).sort({ createdAt: -1 });
};

export const STOrder = mongoose.model("STOrder", stOrderSchema);