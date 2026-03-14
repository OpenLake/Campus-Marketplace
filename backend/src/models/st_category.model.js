import mongoose from "mongoose";

const stCategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true // e.g. "books-textbooks"
  },
  description: String,
  icon: String,   // FontAwesome class or image URL
  parentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "STCategory", 
    default: null 
  }, // for sub-categories
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true,
  collection: "st_categories"
});

// Generate slug from name before saving
stCategorySchema.pre("save", function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

export const STCategory = mongoose.model("STCategory", stCategorySchema);