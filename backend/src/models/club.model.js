import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

/**
 * Club / Society Model
 *
 * Represents a student club or society on campus that can sell merch,
 * event tickets, and other products to students.
 *
 * Design decisions:
 * - `admins[]` is an array so multiple club members can manage the store
 * - `slug` is the URL-friendly identifier used in public storefront links
 * - `razorpayRouteAccountId` is for future Razorpay Route (split payments)
 * - `isVerified` must be set by platform admin before the club can sell
 * - `stats` is denormalized for fast dashboard reads (updated atomically on each order)
 */

const CLUB_STATUS = ["pending", "active", "suspended", "archived"];

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Club name is required"],
      trim: true,
      minlength: [2, "Club name must be at least 2 characters"],
      maxlength: [100, "Club name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be URL-friendly (lowercase letters, numbers, hyphens)",
      ],
    },
    description: {
      type: String,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    shortDescription: {
      type: String,
      maxlength: [200, "Short description cannot exceed 200 characters"],
    },
    logoUrl: {
      type: String,
      default: null,
    },
    bannerUrl: {
      type: String,
      default: null,
    },

    // --- Ownership & Access ---
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admins: {
      type: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          role: {
            type: String,
            enum: ["owner", "manager", "editor"],
            default: "manager",
          },
          addedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      validate: [
        (val) => val.length <= 20,
        "A club cannot have more than 20 admins",
      ],
    },

    // --- Verification & Status ---
    status: {
      type: String,
      enum: CLUB_STATUS,
      default: "pending",
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: {
      type: Date,
    },

    // --- Contact & Social ---
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        //@iitbhilai.ac.in
        /^[a-zA-Z0-9._%+-]+@iitbhilai\.ac\.in$/,
        "Contact email must be a valid email address",
      ],
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    socialLinks: {
      instagram: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      website: { type: String, trim: true },
      twitter: { type: String, trim: true },
    },

    // --- Payment Configuration ---
    razorpayRouteAccountId: {
      type: String,
      default: null,
    },

    // --- Denormalized Stats (updated atomically via $inc) ---
    stats: {
      totalProducts: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      activeProducts: { type: Number, default: 0 },
    },

    // --- College-specific ---
    department: {
      type: String,
      enum: ["CSE", "ECE", "ME", "EE", "MSME", "DSAI", "general"],
      default: "general",
    },
    tags: {
      type: [{ type: String, trim: true, lowercase: true, maxlength: 30 }],
      validate: [
        (val) => val.length <= 15,
        "A club cannot have more than 15 tags",
      ],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Virtuals ────────────────────────────────────────────────
clubSchema.virtual("isActive").get(function () {
  return this.status === "active" && this.isVerified;
});

clubSchema.virtual("adminCount").get(function () {
  return this.admins ? this.admins.length : 0;
});

// ─── Instance Methods ────────────────────────────────────────
/**
 * Check if a user is an admin of this club.
 * @param {ObjectId|String} userId
 * @returns {Boolean}
 */
clubSchema.methods.isAdmin = function (userId) {
  return this.admins.some(
    (admin) => admin.user.toString() === userId.toString(),
  );
};

/**
 * Check if a user has a specific admin role in this club.
 * @param {ObjectId|String} userId
 * @param {String} role - "owner" | "manager" | "editor"
 * @returns {Boolean}
 */
clubSchema.methods.hasAdminRole = function (userId, requiredRole) {
  const roleHierarchy = {
    owner: 3,
    manager: 2,
    editor: 1,
  };

  const adminRecord = this.admins.find(
    (admin) => admin.user.toString() === userId.toString(),
  );

  if (!adminRecord) return false;

  // Checks if the user's role weight is >= the required role weight
  return roleHierarchy[adminRecord.role] >= roleHierarchy[requiredRole];
};

/**
 * Generate a unique slug from the club name.
 * Appends a random suffix if the base slug already exists.
 */
clubSchema.statics.generateSlug = async function (name) {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  let slug = baseSlug;
  let counter = 0;
  const maxAttempts = 10;

  while (counter < maxAttempts) {
    const exists = await this.findOne({ slug });
    if (!exists) return slug;
    counter++;
    slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
  }

  // Fallback: append timestamp
  return `${baseSlug}-${Date.now()}`;
};

// ─── Indexes ─────────────────────────────────────────────────
clubSchema.index({ slug: 1 }, { unique: true });
clubSchema.index({ status: 1, isVerified: 1 });
clubSchema.index({ "admins.user": 1 });
clubSchema.index({ createdBy: 1 });
clubSchema.index({ department: 1 });
clubSchema.index({ name: "text", description: "text", tags: "text" });

// ─── Plugin ──────────────────────────────────────────────────
clubSchema.plugin(mongoosePaginate);

export const Club = mongoose.model("Club", clubSchema);
