import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

//TOCTOU race conditions

const PRODUCT_CATEGORIES = [
  "merch",
  "event-ticket",
  "food",
  "stationery",
  "service",
  "other",
];

const PRODUCT_STATUS = ["draft", "active", "paused", "soldout", "archived"];

// ─── Sub-schemas ─────────────────────────────────────────────

const variantOptionSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, "Variant option label is required"],
      trim: true,
      maxlength: [50, "Label cannot exceed 50 characters"],
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    price: {
      type: Number,
      default: null, // null means use product.price
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }, // Need _id for atomic positional updates
);

const variantGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Variant group name is required"],
      trim: true,
      maxlength: [30, "Variant group name cannot exceed 30 characters"],
      // e.g., "Size", "Color"
    },
    options: {
      type: [variantOptionSchema],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "At least one variant option is required per group",
      },
    },
  },
  { _id: true },
);

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String }, // Cloudinary public ID
    isPrimary: { type: Boolean, default: false },
    altText: { type: String, maxlength: 100 },
  },
  { _id: false },
);

// ─── Main Schema ─────────────────────────────────────────────

const clubProductSchema = new mongoose.Schema(
  {
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: [true, "Club reference is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [150, "Product name cannot exceed 150 characters"],
    },
    description: {
      type: String,
      maxlength: [3000, "Description cannot exceed 3000 characters"],
    },
    shortDescription: {
      type: String,
      maxlength: [200, "Short description cannot exceed 200 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      max: [100000, "Price cannot exceed ₹1,00,000"],
    },
    images: {
      type: [imageSchema],
      validate: {
        validator: function (v) {
          return v && v.length > 0 && v.length <= 10;
        },
        message: "Must have at least 1 and at most 10 images",
      },
    },
    category: {
      type: String,
      enum: PRODUCT_CATEGORIES,
      required: [true, "Category is required"],
      index: true,
    },

    // --- Variants ---
    hasVariants: {
      type: Boolean,
      default: false,
    },
    variants: [variantGroupSchema],

    // --- Stock (for non-variant products, or denormalized total) ---
    totalStock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
      index: true,
    },

    // --- Sale Window ---
    status: {
      type: String,
      enum: PRODUCT_STATUS,
      default: "draft",
      index: true,
    },
    saleStartsAt: {
      type: Date,
      default: null, // null = immediately available when status is "active"
    },
    saleEndsAt: {
      type: Date,
      default: null, // null = no end date
    },

    // --- Purchase Limits ---
    maxPerStudent: {
      type: Number,
      default: 5,
      min: [1, "Minimum purchase limit is 1"],
      max: [50, "Maximum purchase limit is 50"],
    },
    requiresDelivery: {
      type: Boolean,
      default: true,
    },
    deliveryNote: {
      type: String,
      maxlength: [300, "Delivery note cannot exceed 300 characters"],
    },

    // --- Denormalized Counters (updated atomically) ---
    orderCount: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },

    // --- Metadata ---
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [20, "Tag cannot exceed 20 characters"],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Virtuals ────────────────────────────────────────────────

clubProductSchema.virtual("isOnSale").get(function () {
  if (this.status !== "active") return false;
  const now = new Date();
  if (this.saleStartsAt && now < this.saleStartsAt) return false;
  if (this.saleEndsAt && now > this.saleEndsAt) return false;
  return true;
});

clubProductSchema.virtual("isOutOfStock").get(function () {
  return this.totalStock <= 0;
});

clubProductSchema.virtual("primaryImage").get(function () {
  if (!this.images || this.images.length === 0) return null;
  const primary = this.images.find((img) => img.isPrimary);
  return primary ? primary.url : this.images[0].url;
});

// ─── Static Methods: ATOMIC Stock Operations ─────────────────

/**
 * ATOMIC stock decrement for NON-VARIANT products.
 *
 * This is the core race-condition fix. A single findOneAndUpdate call
 * that checks `totalStock >= quantity` and decrements in one atomic op.
 *
 * @param {ObjectId} productId
 * @param {Number} quantity - How many units to reserve
 * @returns {Document|null} - Updated product, or null if insufficient stock
 */
clubProductSchema.statics.decrementStock = async function (
  productId,
  quantity = 1,
) {
  if (quantity <= 0) throw new Error("Quantity must be positive");

  const result = await this.findOneAndUpdate(
    {
      _id: productId,
      hasVariants: false,
      totalStock: { $gte: quantity },
      status: "active",
    },
    {
      $inc: {
        totalStock: -quantity,
        orderCount: 1,
      },
    },
    { new: true },
  );

  // Auto-mark as soldout if stock hit zero
  if (result && result.totalStock === 0) {
    result.status = "soldout";
    await result.save();
  }

  return result; // null = out of stock or product not found/active
};

/**
 * ATOMIC stock decrement for a specific VARIANT OPTION.
 *
 * Uses the positional $ operator to target the exact array element.
 * MongoDB guarantees this entire update is atomic per document.
 *
 * @param {ObjectId} productId
 * @param {ObjectId} optionId - The _id of the variant option
 * @param {Number} quantity
 * @returns {Document|null} - Updated product, or null if insufficient stock
 */
clubProductSchema.statics.decrementVariantStock = async function (
  productId,
  optionId,
  quantity = 1,
) {
  if (quantity <= 0) throw new Error("Quantity must be positive");

  // Use $elemMatch in the filter to find the exact option with enough stock,
  // then the positional $ in $inc targets that same matched element.
  const result = await this.findOneAndUpdate(
    {
      _id: productId,
      hasVariants: true,
      status: "active",
      "variants.options": {
        $elemMatch: {
          _id: optionId,
          stock: { $gte: quantity },
          isAvailable: true,
        },
      },
    },
    {
      $inc: {
        "variants.$[].options.$[opt].stock": -quantity,
        totalStock: -quantity,
        orderCount: 1,
      },
    },
    {
      new: true,
      arrayFilters: [{ "opt._id": optionId }],
    },
  );

  // Auto-mark as soldout if total stock hit zero
  if (result && result.totalStock <= 0) {
    result.status = "soldout";
    await result.save();
  }

  return result; // null = out of stock or product not found
};

/**
 * ATOMIC stock restoration — called when payment fails or order is cancelled.
 * This is the mirror of decrementStock.
 *
 * @param {ObjectId} productId
 * @param {Number} quantity
 * @returns {Document|null}
 */
clubProductSchema.statics.restoreStock = async function (
  productId,
  quantity = 1,
) {
  if (quantity <= 0) throw new Error("Quantity must be positive");

  const result = await this.findOneAndUpdate(
    { _id: productId, hasVariants: false },
    {
      $inc: {
        totalStock: quantity,
        orderCount: -1,
      },
    },
    { new: true },
  );

  // If product was soldout, reactivate it
  if (result && result.status === "soldout" && result.totalStock > 0) {
    result.status = "active";
    await result.save();
  }

  return result;
};

/**
 * ATOMIC variant stock restoration.
 *
 * @param {ObjectId} productId
 * @param {ObjectId} optionId
 * @param {Number} quantity
 * @returns {Document|null}
 */
clubProductSchema.statics.restoreVariantStock = async function (
  productId,
  optionId,
  quantity = 1,
) {
  if (quantity <= 0) throw new Error("Quantity must be positive");

  const result = await this.findOneAndUpdate(
    {
      _id: productId,
      hasVariants: true,
    },
    {
      $inc: {
        "variants.$[].options.$[opt].stock": quantity,
        totalStock: quantity,
        orderCount: -1,
      },
    },
    {
      new: true,
      arrayFilters: [{ "opt._id": optionId }],
    },
  );

  // Reactivate if was soldout
  if (result && result.status === "soldout" && result.totalStock > 0) {
    result.status = "active";
    await result.save();
  }

  return result;
};

/**
 * Get the effective price for a variant option.
 * Falls back to product.price if option.price is null.
 *
 * @param {ObjectId} optionId
 * @returns {Number}
 */
clubProductSchema.methods.getEffectivePrice = function (optionId) {
  if (!this.hasVariants) return this.price;

  for (const group of this.variants) {
    const option = group.options.find(
      (opt) => opt._id.toString() === optionId.toString(),
    );
    if (option) {
      return option.price != null ? option.price : this.price;
    }
  }

  return this.price;
};

/**
 * Recompute totalStock from all variant options.
 * Use this after manual admin stock edits.
 */
clubProductSchema.methods.recalculateTotalStock = function () {
  if (!this.hasVariants) return;

  let total = 0;
  for (const group of this.variants) {
    for (const option of group.options) {
      total += option.stock;
    }
  }
  this.totalStock = total;
};

// ─── Pre-save Middleware ─────────────────────────────────────

clubProductSchema.pre("save", function (next) {
  // Sync totalStock from variants on new products
  if (this.isNew && this.hasVariants) {
    this.recalculateTotalStock();
  }

  // Ensure at least one primary image
  if (
    this.images &&
    this.images.length > 0 &&
    !this.images.some((img) => img.isPrimary)
  ) {
    this.images[0].isPrimary = true;
  }

  next();
});

// ─── Indexes ─────────────────────────────────────────────────

// Core queries: "list products for club X that are active"
clubProductSchema.index({ club: 1, status: 1 });

// Sale window queries: "products currently on sale"
clubProductSchema.index({ status: 1, saleStartsAt: 1, saleEndsAt: 1 });

// Category browsing within a club
clubProductSchema.index({ club: 1, category: 1, status: 1 });

// Stock monitoring: "products with low stock"
clubProductSchema.index({ club: 1, totalStock: 1 });

// Full-text search
clubProductSchema.index({ name: "text", description: "text", tags: "text" });

// Sorting: newest first, most ordered
clubProductSchema.index({ createdAt: -1 });
clubProductSchema.index({ orderCount: -1 });

// ─── Plugin ──────────────────────────────────────────────────
clubProductSchema.plugin(mongoosePaginate);

export const ClubProduct = mongoose.model("ClubProduct", clubProductSchema);
export { PRODUCT_CATEGORIES, PRODUCT_STATUS };
