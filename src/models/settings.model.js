import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    category: {
      type: String,
      enum: ["general", "security", "payment", "notification"],
      default: "general",
    },
    description: {
      type: String,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Static Methods
settingsSchema.statics.getSetting = function (key) {
  return this.findOne({ key, isActive: true });
};

settingsSchema.statics.setSetting = function (
  key,
  value,
  category = "general"
) {
  return this.findOneAndUpdate(
    { key },
    { key, value, category },
    { upsert: true, new: true }
  );
};

settingsSchema.statics.getByCategory = function (category) {
  return this.find({ category, isActive: true });
};

// Indexes
settingsSchema.index({ category: 1, isActive: 1 });

export default mongoose.model("Settings", settingsSchema);
