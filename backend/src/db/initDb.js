// src/db/initDb.js
import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { STCategory } from '../models/st_category.model.js'; // Add this import

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a connection pool for administrative tasks (connecting to default 'postgres' db)
const adminPool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  database: 'postgres', // Connect to default postgres database
});

// Connection pool for your application database
let appPool;

/**
 * Seed categories in MongoDB
 */
const seedCategories = async () => {
  console.log('🌱 Seeding categories...');
  
  const categories = [
    { 
      name: "Books", 
      description: "Textbooks, novels, study materials, and academic resources",
      icon: "📚",
      isActive: true
    },
    { 
      name: "Electronics", 
      description: "Laptops, phones, tablets, headphones, and gadgets",
      icon: "💻",
      isActive: true
    },
    { 
      name: "Furniture", 
      description: "Chairs, tables, desks, shelves, and storage solutions",
      icon: "🪑",
      isActive: true
    },
    { 
      name: "Clothing", 
      description: "Apparel, accessories, footwear, and fashion items",
      icon: "👕",
      isActive: true
    },
    { 
      name: "Sports", 
      description: "Sports equipment, gym gear, cycling accessories",
      icon: "⚽",
      isActive: true
    },
    { 
      name: "Stationery", 
      description: "Pens, notebooks, art supplies, and office materials",
      icon: "✏️",
      isActive: true
    },
    { 
      name: "Vehicles", 
      description: "Bicycles, scooters, and other personal vehicles",
      icon: "🚲",
      isActive: true
    },
    { 
      name: "Instruments", 
      description: "Musical instruments and accessories",
      icon: "🎸",
      isActive: true
    },
    { 
      name: "Games", 
      description: "Board games, video games, and gaming accessories",
      icon: "🎮",
      isActive: true
    },
    { 
      name: "Others", 
      description: "Miscellaneous items that don't fit other categories",
      icon: "📦",
      isActive: true
    }
  ];

  try {
    let seededCount = 0;
    
    for (const cat of categories) {
      // Generate slug from name
      const slug = cat.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Check if category already exists
      const existing = await STCategory.findOne({ 
        $or: [{ name: cat.name }, { slug }] 
      });
      
      if (!existing) {
        await STCategory.create({
          ...cat,
          slug
        });
        seededCount++;
        console.log(`  ✅ Created: ${cat.name}`);
      } else {
        console.log(`  ⏭️  Already exists: ${cat.name}`);
      }
    }
    
    if (seededCount > 0) {
      console.log(`✅ Seeded ${seededCount} new categories`);
    } else {
      console.log('✅ All categories already exist');
    }
    
    // Show total categories count
    const totalCategories = await STCategory.countDocuments();
    console.log(`📊 Total categories in database: ${totalCategories}`);
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error; // Re-throw to handle in main function
  }
};

/**
 * Seed sub-categories (optional - for more detailed categorization)
 */
const seedSubCategories = async () => {
  console.log('🌱 Seeding sub-categories...');
  
  // First, get parent categories
  const books = await STCategory.findOne({ name: "Books" });
  const electronics = await STCategory.findOne({ name: "Electronics" });
  const clothing = await STCategory.findOne({ name: "Clothing" });
  
  const subCategories = [
    // Books sub-categories
    { 
      name: "Textbooks", 
      slug: "textbooks",
      description: "Course textbooks and academic books",
      icon: "📖",
      parentId: books?._id,
      isActive: true
    },
    { 
      name: "Novels", 
      slug: "novels",
      description: "Fiction, non-fiction, and literary works",
      icon: "📘",
      parentId: books?._id,
      isActive: true
    },
    { 
      name: "Study Guides", 
      slug: "study-guides",
      description: "Exam preparation materials and guides",
      icon: "📝",
      parentId: books?._id,
      isActive: true
    },
    
    // Electronics sub-categories
    { 
      name: "Laptops", 
      slug: "laptops",
      description: "Laptops and notebooks",
      icon: "💻",
      parentId: electronics?._id,
      isActive: true
    },
    { 
      name: "Smartphones", 
      slug: "smartphones",
      description: "Mobile phones and accessories",
      icon: "📱",
      parentId: electronics?._id,
      isActive: true
    },
    { 
      name: "Audio", 
      slug: "audio",
      description: "Headphones, speakers, and audio equipment",
      icon: "🎧",
      parentId: electronics?._id,
      isActive: true
    },
    
    // Clothing sub-categories
    { 
      name: "Men's Wear", 
      slug: "mens-wear",
      description: "Clothing for men",
      icon: "👔",
      parentId: clothing?._id,
      isActive: true
    },
    { 
      name: "Women's Wear", 
      slug: "womens-wear",
      description: "Clothing for women",
      icon: "👗",
      parentId: clothing?._id,
      isActive: true
    }
  ];

  for (const subCat of subCategories) {
    if (!subCat.parentId) continue; // Skip if parent doesn't exist
    
    const existing = await STCategory.findOne({ 
      slug: subCat.slug 
    });
    
    if (!existing) {
      await STCategory.create(subCat);
      console.log(`  ✅ Created sub-category: ${subCat.name}`);
    }
  }
};

const initDatabase = async () => {
  console.log('🚀 Initializing database...');
  
  try {
    // 1. Check if application database exists, create if not
    const dbName = process.env.PG_DATABASE || 'campus_pg';
    
    const checkDb = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );
    
    if (checkDb.rowCount === 0) {
      console.log(`📦 Creating database: ${dbName}`);
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      console.log('✅ Database created successfully');
    } else {
      console.log(`✅ Database ${dbName} already exists`);
    }
    
    // Close admin connection
    await adminPool.end();
    
    // 2. Now connect to the application database
    appPool = new Pool({
      host: process.env.PG_HOST || 'localhost',
      port: process.env.PG_PORT || 5432,
      user: process.env.PG_USER || 'postgres',
      password: process.env.PG_PASSWORD || 'postgres',
      database: dbName,
    });
    
    // 3. Read and execute the schema SQL file
    console.log('📝 Creating/updating tables...');
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'init.sql'),
      'utf8'
    );
    
    // Split SQL into individual statements and execute
    const statements = schemaSQL
      .split(';')
      .filter(statement => statement.trim() !== '');
    
    for (let statement of statements) {
      if (statement.trim()) {
        await appPool.query(statement);
      }
    }
    
    console.log('✅ Tables created/verified successfully');
    
    // 4. Test PostgreSQL connection
    const testResult = await appPool.query('SELECT NOW()');
    console.log(`🕐 PostgreSQL time: ${testResult.rows[0].now}`);
    console.log('📊 PostgreSQL connected successfully');
    
    // 5. Connect to MongoDB
    console.log(' Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log(' MongoDb connected ✅');
    
    // 6. Seed categories in MongoDB
    await seedCategories();
    
    // 7. Optional: Seed sub-categories
    await seedSubCategories();
    
    return appPool;
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

export { initDatabase, appPool };