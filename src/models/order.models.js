import mongoose from "mongoose";

const ORDER_STATUS = ["pending", "confirmed", "delivered", "cancelled"];

const PAYMENT_STATUS = ["pending", "completed", "failed", "refunded"];

const DELIVERY_METHODS = ["pickup", "delivery"];

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
      default: function () {
        return (
          "ORD" +
          Date.now() +
          Math.random().toString(36).substr(2, 4).toUpperCase()
        );
      },
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, "Quantity must be at least 1"],
    },
    pricing: {
      itemPrice: {
        type: Number,
        required: true,
        min: [0, "Item price cannot be negative"],
      },
      deliveryFee: {
        type: Number,
        default: 0,
        min: [0, "Delivery fee cannot be negative"],
      },
      total: {
        type: Number,
        required: true,
        min: [0, "Total cannot be negative"],
      },
    },
    status: {
      type: String,
      enum: ORDER_STATUS,
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS,
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "cash", "card"],
      required: true,
    },
    transactionId: {
      type: String,
      sparse: true,
    },
    deliveryMethod: {
      type: String,
      enum: DELIVERY_METHODS,
      required: true,
      default: "pickup",
    },
    deliveryAddress: {
      hostel: {
        type: String,
        enum: ["kanhar", "Gopad", "Indravati", "Shivnath"],
      },
      roomNo: { type: String, trim: true },
      contactNumber: { type: String },
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
  },
  {
    timestamps: true,
  }
);

// Middleware
orderSchema.pre("save", function (next) {
  // Calculate total
  this.pricing.total =
    this.pricing.itemPrice * this.quantity + this.pricing.deliveryFee;
  next();
});

// Methods
orderSchema.methods.markAsCompleted = function () {
  this.status = "delivered";
  this.paymentStatus = "completed";
  this.completedAt = new Date();
  return this.save();
};

orderSchema.methods.cancel = function (reason) {
  this.status = "cancelled";
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  return this.save();
};

// Static Methods
orderSchema.statics.getUserOrders = function (userId, role = "buyer") {
  const field = role === "buyer" ? "buyer" : "seller";
  return this.find({ [field]: userId })
    .populate("listing", "title images price")
    .populate(role === "buyer" ? "seller" : "buyer", "name username")
    .sort({ createdAt: -1 });
};

orderSchema.statics.getOrderStats = function (userId, role = "buyer") {
  const field = role === "buyer" ? "buyer" : "seller";
  return this.aggregate([
    { $match: { [field]: userId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$pricing.total" },
      },
    },
  ]);
};

// Indexes
orderSchema.index({ buyer: 1, status: 1 });
orderSchema.index({ seller: 1, status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model("Order", orderSchema);
