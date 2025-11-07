# MongoDB Queries for Campus Marketplace

## Connection Commands

### Docker Environment

```bash
# Connect to MongoDB in Docker
docker exec -it campus-marketplace-mongo mongosh campus-marketplace

# Run query from command line
docker exec campus-marketplace-mongodb mongosh campus-marketplace --eval 'QUERY_HERE'
```

### Local Environment

```bash
# Connect to local MongoDB
mongosh "mongodb://localhost:27017/campus-marketplace"
```

---

## 👤 User Management Queries

### View All Users

```javascript
// Show all users with key fields
db.users
  .find(
    {},
    {
      username: 1,
      email: 1,
      name: 1,
      roles: 1,
      isVerified: 1,
      createdAt: 1,
    }
  )
  .pretty();

// Count total users
db.users.countDocuments();
```

### Find User by Email/Username

```javascript
// By email
db.users.findOne({ email: "student_demo@university.edu" });

// By username
db.users.findOne({ username: "student_demo" });

// By ID
db.users.findOne({ _id: ObjectId("YOUR_ID_HERE") });
```

### Find Users by Role

```javascript
// Find all students
db.users.find({ roles: "student" }, { username: 1, email: 1, roles: 1 });

// Find all admins
db.users.find({ roles: "admin" }, { username: 1, email: 1, roles: 1 });

// Find users with multiple roles
db.users.find(
  {
    $or: [{ roles: "admin" }, { roles: "moderator" }],
  },
  { username: 1, email: 1, roles: 1 }
);

// Find users with specific role combination
db.users.find({
  roles: { $all: ["student", "vendor-admin"] },
});
```

### Update User Roles

```javascript
// Add role to user
db.users.updateOne(
  { username: "student_demo" },
  { $addToSet: { roles: "vendor-admin" } }
);

// Set multiple roles (replace existing)
db.users.updateOne(
  { username: "student_demo" },
  { $set: { roles: ["student", "vendor-admin", "club-admin"] } }
);

// Remove a role
db.users.updateOne(
  { username: "student_demo" },
  { $pull: { roles: "vendor-admin" } }
);
```

### Update User Information

```javascript
// Update email
db.users.updateOne(
  { username: "student_demo" },
  { $set: { email: "newemail@university.edu" } }
);

// Update phone and hostel
db.users.updateOne(
  { username: "student_demo" },
  {
    $set: {
      phone: "+91 9876543210",
      hostel: "Hostel A, Room 101",
    },
  }
);

// Verify user email
db.users.updateOne(
  { email: "student_demo@university.edu" },
  { $set: { isVerified: true } }
);
```

### Delete Users

```javascript
// Delete single user
db.users.deleteOne({ username: "student_demo" });

// Delete users by role
db.users.deleteMany({ roles: "student" });

// Delete unverified users older than 7 days
db.users.deleteMany({
  isVerified: false,
  createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
});
```

---

## 📦 Listing Management Queries

### View All Listings

```javascript
// Show all listings
db.listings
  .find(
    {},
    {
      title: 1,
      price: 1,
      category: 1,
      status: 1,
      seller: 1,
      createdAt: 1,
    }
  )
  .pretty();

// Count total listings
db.listings.countDocuments();
```

### Find Listings by Status

```javascript
// Available listings
db.listings.find(
  { status: "available" },
  {
    title: 1,
    price: 1,
    seller: 1,
  }
);

// Sold listings
db.listings.find({ status: "sold" });

// Reserved listings
db.listings.find({ status: "reserved" });
```

### Find Listings by Category

```javascript
// Electronics
db.listings.find(
  { category: "electronics" },
  {
    title: 1,
    price: 1,
    condition: 1,
  }
);

// Books
db.listings.find({ category: "books" });

// Count by category
db.listings.aggregate([
  { $group: { _id: "$category", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]);
```

### Find Listings by Price Range

```javascript
// Between ₹500 and ₹2000
db.listings
  .find(
    {
      price: { $gte: 500, $lte: 2000 },
    },
    {
      title: 1,
      price: 1,
      category: 1,
    }
  )
  .sort({ price: 1 });

// Less than ₹1000
db.listings.find({ price: { $lt: 1000 } });

// Greater than ₹5000
db.listings.find({ price: { $gt: 5000 } });
```

### Find Listings by Seller

```javascript
// By seller ID
db.listings.find({ seller: ObjectId("USER_ID_HERE") });

// Populate seller info (lookup)
db.listings.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "seller",
      foreignField: "_id",
      as: "sellerInfo",
    },
  },
  {
    $project: {
      title: 1,
      price: 1,
      "sellerInfo.username": 1,
      "sellerInfo.email": 1,
    },
  },
]);
```

### Search Listings

```javascript
// Text search in title or description
db.listings.find({
  $or: [
    { title: { $regex: "laptop", $options: "i" } },
    { description: { $regex: "laptop", $options: "i" } },
  ],
});

// Create text index first (run once)
db.listings.createIndex({ title: "text", description: "text" });

// Then use text search
db.listings.find({ $text: { $search: "laptop" } });
```

### Update Listing

```javascript
// Mark as sold
db.listings.updateOne(
  { _id: ObjectId("LISTING_ID") },
  { $set: { status: "sold" } }
);

// Update price
db.listings.updateOne(
  { _id: ObjectId("LISTING_ID") },
  { $set: { price: 1500 } }
);

// Update multiple fields
db.listings.updateOne(
  { _id: ObjectId("LISTING_ID") },
  {
    $set: {
      title: "Updated Title",
      description: "Updated Description",
      price: 2000,
    },
  }
);
```

### Delete Listings

```javascript
// Delete single listing
db.listings.deleteOne({ _id: ObjectId("LISTING_ID") });

// Delete all sold listings
db.listings.deleteMany({ status: "sold" });

// Delete listings by seller
db.listings.deleteMany({ seller: ObjectId("USER_ID") });
```

---

## 📊 Analytics & Statistics

### User Statistics

```javascript
// Count users by role
db.users.aggregate([
  { $unwind: "$roles" },
  { $group: { _id: "$roles", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]);

// Users registered this month
db.users.countDocuments({
  createdAt: {
    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  },
});

// Verified vs unverified users
db.users.aggregate([
  {
    $group: {
      _id: "$isVerified",
      count: { $sum: 1 },
    },
  },
]);
```

### Listing Statistics

```javascript
// Listings by status
db.listings.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

// Average price by category
db.listings.aggregate([
  {
    $group: {
      _id: "$category",
      avgPrice: { $avg: "$price" },
      count: { $sum: 1 },
    },
  },
  { $sort: { avgPrice: -1 } },
]);

// Most active sellers
db.listings.aggregate([
  { $group: { _id: "$seller", totalListings: { $sum: 1 } } },
  { $sort: { totalListings: -1 } },
  { $limit: 10 },
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "userInfo",
    },
  },
  {
    $project: {
      totalListings: 1,
      "userInfo.username": 1,
      "userInfo.email": 1,
    },
  },
]);

// Listings created this week
db.listings.countDocuments({
  createdAt: {
    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
});
```

---

## 🔧 Maintenance Queries

### Cleanup Operations

```javascript
// Remove expired refresh tokens
db.users.updateMany(
  {},
  {
    $pull: {
      refreshToken: {
        expiresAt: { $lt: new Date() },
      },
    },
  }
);

// Remove unverified users older than 30 days
db.users.deleteMany({
  isVerified: false,
  createdAt: {
    $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
});

// Remove listings without images
db.listings.deleteMany({
  $or: [{ images: { $exists: false } }, { images: { $size: 0 } }],
});
```

### Index Management

```javascript
// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ roles: 1 });
db.listings.createIndex({ seller: 1 });
db.listings.createIndex({ category: 1 });
db.listings.createIndex({ status: 1 });
db.listings.createIndex({ createdAt: -1 });
db.listings.createIndex({ price: 1 });

// Create text index for search
db.listings.createIndex({
  title: "text",
  description: "text",
});

// View all indexes
db.users.getIndexes();
db.listings.getIndexes();

// Drop an index
db.listings.dropIndex("index_name");
```

### Backup & Restore

```bash
# Backup entire database
mongodump --uri="mongodb://localhost:27017/campus-marketplace" --out=/backup/

# Backup specific collection
mongodump --uri="mongodb://localhost:27017/campus-marketplace" --collection=users --out=/backup/

# Restore database
mongorestore --uri="mongodb://localhost:27017/campus-marketplace" /backup/campus-marketplace/

# Docker backup
docker exec campus-marketplace-mongodb mongodump --db=campus-marketplace --out=/backup/
docker cp campus-marketplace-mongodb:/backup ./backup
```

---

## 🔍 Advanced Queries

### Complex Filtering

```javascript
// Available electronics under ₹3000 in good condition
db.listings
  .find({
    category: "electronics",
    status: "available",
    price: { $lte: 3000 },
    condition: { $in: ["good", "like-new", "brand-new"] },
  })
  .sort({ price: 1 });

// Listings with at least 3 images
db.listings.find({
  images: { $exists: true },
  $expr: { $gte: [{ $size: "$images" }, 3] },
});
```

### Aggregation Pipeline Examples

```javascript
// Get user with their listing count
db.users.aggregate([
  {
    $lookup: {
      from: "listings",
      localField: "_id",
      foreignField: "seller",
      as: "listings",
    },
  },
  {
    $project: {
      username: 1,
      email: 1,
      totalListings: { $size: "$listings" },
      activeListings: {
        $size: {
          $filter: {
            input: "$listings",
            as: "listing",
            cond: { $eq: ["$$listing.status", "available"] },
          },
        },
      },
    },
  },
]);

// Price statistics by category
db.listings.aggregate([
  { $match: { status: "available" } },
  {
    $group: {
      _id: "$category",
      avgPrice: { $avg: "$price" },
      minPrice: { $min: "$price" },
      maxPrice: { $max: "$price" },
      totalListings: { $sum: 1 },
    },
  },
  { $sort: { avgPrice: -1 } },
]);
```

---

## 🚀 Quick Start Commands

### Setup Test Data

```javascript
// Create a test user
db.users.insertOne({
  username: "testuser",
  email: "testuser@university.edu",
  password: "$2a$10$HASHED_PASSWORD_HERE",
  name: "Test User",
  roles: ["student"],
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Create a test listing
db.listings.insertOne({
  title: "Test Laptop",
  description: "A great laptop for students",
  price: 25000,
  category: "electronics",
  condition: "good",
  images: ["image1.jpg"],
  location: "Campus Store",
  status: "available",
  seller: ObjectId("USER_ID_HERE"),
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

### View Collections

```javascript
// Show all collections
show collections

// Show collection statistics
db.users.stats()
db.listings.stats()
```

### Drop Collections (DANGER!)

```javascript
// Drop users collection
db.users.drop();

// Drop listings collection
db.listings.drop();

// Drop entire database
db.dropDatabase();
```

---

## 💡 Tips

1. **Always backup before bulk operations**
2. **Use `explain()` to analyze query performance**
   ```javascript
   db.listings.find({ category: "electronics" }).explain("executionStats");
   ```
3. **Create indexes for frequently queried fields**
4. **Use aggregation pipelines for complex operations**
5. **Test queries on a small dataset first**

---

**Last Updated**: November 6, 2025  
**Project**: Campus Marketplace - IIT Bhilai

db.listings.insertMany([
  {
    title: "Casio Scientific Calculator",
    description: "Almost new Casio calculator, perfect for engineering students.",
    price: 450,
    category: "electronics",
    condition: "like-new",
    images: ["https://i.imgur.com/abc123.jpg"],
    location: "Hostel A, Room 101",
    status: "available",
    seller: ObjectId("690ba55bd4584dd2215eeb4f"),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "IIT Bhilai Hoodie",
    description: "Official IIT Bhilai hoodie, size L, barely used.",
    price: 700,
    category: "apparel",
    condition: "good",
    images: ["https://i.imgur.com/def456.jpg"],
    location: "Hostel B, Room 202",
    status: "available",
    seller: ObjectId("690ba992d4584dd2215eeb6a"),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Engineering Drawing Kit",
    description: "Complete drawing kit for first-year students.",
    price: 350,
    category: "stationery",
    condition: "brand-new",
    images: ["https://i.imgur.com/ghi789.jpg"],
    location: "Academic Block",
    status: "available",
    seller: ObjectId("690baaa8d4584dd2215eeb73"),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "C Programming Book",
    description: "Let Us C by Yashavant Kanetkar, 6th Edition.",
    price: 150,
    category: "books",
    condition: "fair",
    images: ["https://i.imgur.com/jkl012.jpg"],
    location: "Library",
    status: "available",
    seller: ObjectId("690baab3d4584dd2215eeb78"),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Bluetooth Earphones",
    description: "Boat Rockerz wireless earphones, 1 year old, working perfectly.",
    price: 900,
    category: "electronics",
    condition: "good",
    images: ["https://i.imgur.com/mno345.jpg"],
    location: "Hostel C, Room 303",
    status: "available",
    seller: ObjectId("690bab7ed4584dd2215eeb83"),
    createdAt: new Date(),
    updatedAt: new Date()
  }
])