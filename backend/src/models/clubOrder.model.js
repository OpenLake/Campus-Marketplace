import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

// separate from order.model.js to avoid circular refs with ClubProduct and Club schemas

const ORDER_STATUS = [
  "payment_pending",
  "confirmed",
  "processing",
  "ready",
  "delivered",
  "cancelled",
  "refunded",
  "payment_failed",
  "expired",
];

const PAYMENT_STATUS = [
  "pending",
  "created", // Razorpay order created, awaiting payment
  "captured", // Payment successfully captured
  "failed",
  "refund_initiated",
  "refunded",
];

const DELIVERY_TYPES = ["pickup", "hostel-delivery"];
// --utility schema-- for generating sequential order numbers like "CLB-2026-00001"
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g., "orderSequence_2026"
  seq: { type: Number, default: 0 },
});
// Compile it into a model immediately
const Counter = mongoose.model("Counter", counterSchema);

// ─── Sub-schemas ─────────────────────────────────────────────

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClubProduct",
      required: true,
    },
    variantOptionId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null, // null = no variant (simple product)
    },
    variantLabel: {
      type: String,
      default: null, // e.g., "Size: Large"
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, "Unit price cannot be negative"],
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    // Snapshot fields — frozen at order time so the order record
    // remains accurate even if the product is later edited/deleted
    snapshotName: {
      type: String,
      required: true,
    },
    snapshotImage: {
      type: String,
      default: null,
    },
  },
  { _id: true },
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ORDER_STATUS,
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    note: {
      type: String,
      maxlength: [300, "Status note cannot exceed 300 characters"],
    },
  },
  { _id: false },
);

const paymentSchema = new mongoose.Schema(
  {
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    status: {
      type: String,
      enum: PAYMENT_STATUS,
      default: "pending",
    },
    method: {
      type: String, // "upi", "card", "netbanking", etc. (from Razorpay callback)
      default: null,
    },
    paidAt: {
      type: Date,
    },
    amount: {
      type: Number, // in paise (e.g., ₹499 = 49900)
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    refundId: {
      type: String,
      default: null,
    },
    refundedAt: {
      type: Date,
    },
  },
  { _id: false },
);

// ─── Main Schema ─────────────────────────────────────────────

const clubOrderSchema = new mongoose.Schema(
  {
    // Human-readable order number: "CLB-2026-00001"
    orderNumber: {
      type: String,
      required: true,
    },

    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
      index: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "Order must have at least one item",
      },
    },

    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"],
    },

    // --- Payment ---
    payment: {
      type: paymentSchema,
      required: true,
    },

    // --- Idempotency ---
    idempotencyKey: {
      type: String,
      required: true,
    },

    // --- Status ---
    status: {
      type: String,
      enum: ORDER_STATUS,
      default: "payment_pending",
      index: true,
    },
    statusHistory: [statusHistorySchema],

    // --- Stock Reservation TTL ---
    // Orders in "payment_pending" state older than this are cleaned up
    reservedUntil: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      },
    },
    stockRestored: {
      type: Boolean,
      default: false, // Tracks if stock was already restored to prevent double-restore
    },

    // --- Delivery ---
    deliveryType: {
      type: String,
      enum: DELIVERY_TYPES,
      default: "pickup",
    },
    deliveryDetails: {
      hostel: {
        type: String,
        enum: ["kanhar", "Gopad", "Indravati", "Shivnath"],
      },
      roomNo: { type: String, trim: true },
      pickupSlot: { type: String, trim: true },
      pickupLocation: { type: String, trim: true },
    },

    // --- Buyer Info Snapshot ---
    buyerSnapshot: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
    },

    // --- Notes ---
    buyerNote: {
      type: String,
      maxlength: [500, "Note cannot exceed 500 characters"],
    },
    adminNote: {
      type: String,
      maxlength: [500, "Admin note cannot exceed 500 characters"],
    },

    // --- Cancellation ---
    cancelledAt: { type: Date },
    cancelReason: { type: String, maxlength: 300 },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Virtuals ────────────────────────────────────────────────

clubOrderSchema.virtual("isPaid").get(function () {
  return this.payment?.status === "captured";
});

clubOrderSchema.virtual("isExpired").get(function () {
  return (
    this.status === "payment_pending" &&
    this.reservedUntil &&
    new Date() > this.reservedUntil
  );
});

clubOrderSchema.virtual("itemCount").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// ─── Instance Methods ────────────────────────────────────────

/**
 * Allowed status transitions (state machine).
 * Prevents invalid jumps like "delivered" → "payment_pending".
 */
const VALID_TRANSITIONS = {
  payment_pending: ["confirmed", "payment_failed", "expired", "cancelled"],
  confirmed: ["processing", "cancelled", "refunded"],
  processing: ["ready", "cancelled", "refunded"],
  ready: ["delivered", "cancelled", "refunded"],
  delivered: ["refunded"],
  cancelled: [], // terminal
  refunded: [], // terminal
  payment_failed: [], // terminal
  expired: [], // terminal
};

/**
 * Transition the order to a new status with validation.
 *
 * @param {String} newStatus
 * @param {ObjectId} changedBy - User who made the change
 * @param {String} note - Optional note
 * @returns {Document} The updated order (unsaved — caller must .save())
 */
clubOrderSchema.methods.transitionTo = function (
  newStatus,
  changedBy = null,
  note = "",
) {
  const allowed = VALID_TRANSITIONS[this.status];

  if (!allowed || !allowed.includes(newStatus)) {
    throw new Error(
      `Invalid status transition: "${this.status}" → "${newStatus}". ` +
        `Allowed transitions: [${(allowed || []).join(", ")}]`,
    );
  }

  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    changedBy,
    note,
    changedAt: new Date(),
  });

  // Side effects
  if (newStatus === "cancelled") {
    this.cancelledAt = new Date();
    this.cancelledBy = changedBy;
    this.cancelReason = note;
  }

  return this;
};

// ─── Static Methods ──────────────────────────────────────────

/**
 * Generate a human-readable order number.
 * Format: CLB-YYYY-NNNNN (zero-padded sequence)
 */
clubOrderSchema.statics.generateOrderNumber = async function () {
  const year = new Date().getFullYear();
  const prefix = `CLB-${year}-`;
  const counterId = `orderSequence_${year}`;

  // Use the Counter model we defined at the top of the file!
  // ATOMIC: Finds the document, increments 'seq' by 1, and returns the NEW document.
  const counterDoc = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }, // upsert = create it if it doesn't exist yet
  );

  // Pad with zeros: 1 -> 00001, 45 -> 00045
  return `${prefix}${String(counterDoc.seq).padStart(5, "0")}`;
};

/**
 * Find expired payment_pending orders that need stock restoration.
 * Used by the cron job.
 *
 * @returns {Array<Document>}
 */
clubOrderSchema.statics.findExpiredPendingOrders = function () {
  return this.find({
    status: "payment_pending",
    stockRestored: false,
    reservedUntil: { $lt: new Date() },
  });
};

/**
 * Count how many units of a product a student has already purchased.
 * Used to enforce `maxPerStudent` limit.
 *
 * @param {ObjectId} buyerId
 * @param {ObjectId} productId
 * @returns {Number}
 */
clubOrderSchema.statics.getStudentPurchaseCount = async function (
  buyerId,
  productId,
) {
  const result = await this.aggregate([
    {
      $match: {
        buyer: new mongoose.Types.ObjectId(buyerId),
        status: {
          $nin: ["cancelled", "payment_failed", "expired", "refunded"],
        },
      },
    },
    { $unwind: "$items" },
    {
      $match: {
        "items.product": new mongoose.Types.ObjectId(productId),
      },
    },
    {
      $group: {
        _id: null,
        totalQuantity: { $sum: "$items.quantity" },
      },
    },
  ]);

  return result.length > 0 ? result[0].totalQuantity : 0;
};

// ─── Indexes ─────────────────────────────────────────────────

// Core lookups
clubOrderSchema.index({ club: 1, status: 1, createdAt: -1 });
clubOrderSchema.index({ buyer: 1, status: 1, createdAt: -1 });

// Unique constraints
clubOrderSchema.index({ orderNumber: 1 }, { unique: true });

// Payment verification
clubOrderSchema.index({ "payment.razorpayOrderId": 1 });
clubOrderSchema.index({ "payment.razorpayPaymentId": 1 }, { sparse: true });

// Idempotency
clubOrderSchema.index({ idempotencyKey: 1 }, { unique: true });

// Cron: find expired pending orders
clubOrderSchema.index({ status: 1, stockRestored: 1, reservedUntil: 1 });

// Admin dashboard: orders by date
clubOrderSchema.index({ club: 1, createdAt: -1 });

// Student purchase count enforcement
clubOrderSchema.index({ buyer: 1, "items.product": 1, status: 1 });

// ─── Plugin ──────────────────────────────────────────────────
clubOrderSchema.plugin(mongoosePaginate);

export const ClubOrder = mongoose.model("ClubOrder", clubOrderSchema);
export { ORDER_STATUS, PAYMENT_STATUS, VALID_TRANSITIONS };
