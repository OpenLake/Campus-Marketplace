// scripts/seed-categories.js
import mongoose from 'mongoose';
import { STCategory } from '../src/models/st_category.model.js';
import dotenv from 'dotenv';

dotenv.config();

const categories = [
  { name: "Books", description: "Textbooks, novels, study materials", icon: "📚" },
  { name: "Electronics", description: "Laptops, phones, gadgets", icon: "💻" },
  { name: "Furniture", description: "Chairs, tables, storage", icon: "🪑" },
  { name: "Clothing", description: "Apparel, accessories", icon: "👕" },
  { name: "Sports", description: "Equipment, gear", icon: "⚽" },
  { name: "Others", description: "Miscellaneous items", icon: "📦" }
];

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    for (const cat of categories) {
      const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await STCategory.findOneAndUpdate(
        { name: cat.name },
        { ...cat, slug },
        { upsert: true, new: true }
      );
      console.log(`  Created: ${cat.name}`);
    }
    
    console.log("\n✅ Categories seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    process.exit(1);
  }
}

seedCategories();