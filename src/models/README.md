# Campus Marketplace - Database Models

This directory contains the simplified, production-ready database schema for the Campus Marketplace application. The models are built using Mongoose with a focus on simplicity, maintainability, and essential functionality.

## 📋 Table of Contents

- Core Models
- Utility Models
- Setup
- Usage Examples
- Architecture Benefits
- Contributing

## 🔧 Core Models

### 1. User Model (`users.models.js`)

**Clean user management with campus-specific features**

**Key Features:**

- 🔐 Secure password hashing with bcrypt
- 🎓 Academic information (student ID, department, year)
- 🏠 Hostel location management
- ⭐ Simple rating system
- 🔒 Basic account security
- 📱 Refresh token management
- 🔔 Notification preferences

### 2. Listing Model (`listing.models.js`)

**Simple marketplace listing system**

**Key Features:**

- 📸 Multiple image support
- 💰 Basic pricing
- 👀 Simple view tracking
- ⏰ Expiry dates
- 🏷️ Category and condition tracking

### 3. Order Model (`order.models.js`)

**Streamlined order management**

**Key Features:**

- 📋 Essential order status tracking (pending, confirmed, delivered, cancelled)
- 💳 Basic payment information
- 🚚 Delivery methods (pickup, delivery)
- � Simple notes system

### 4. Review Model (`reviews.models.js`)

**Basic review and rating system**

**Key Features:**

- ⭐ Multi-criteria rating system
- 📸 Image support in reviews
- 👍 Helpful/not helpful voting
- 💬 Seller response capability
- 🚩 Flag and moderation system
- ✅ Purchase verification
- 📊 Analytics (views, helpfulness ratio)
- 🏷️ Tag system for categorization

### 5. Vendor Model (`vendors.models.js`)

**Professional vendor management**

**Key Features:**

- 🏢 Complete business information management
- 📄 Document verification system
- ⏰ Business hours and special hours
- 💳 Subscription and billing management
- 📊 Comprehensive sales metrics
- 🏆 Badge and certification system
- 👥 Follower management
- 🚫 User blocking capabilities
- 📈 Performance analytics

### 6. Chat Model (`chat.models.js`)

**Real-time messaging system**

**Key Features:**

- 💬 Multiple message types (text, image, file, location)
- 😀 Reaction system
- 📱 Read receipts and typing indicators
- 🔄 Message editing and deletion
- 🔍 Message search functionality
- 🔇 Mute and notification controls
- 👥 Group chat support
- 📊 Chat analytics

### 7. Notification Model (`notification.models.js`)

**Multi-channel notification system**

**Key Features:**

- 📱 Multiple delivery channels (in-app, email, SMS, push)
  **Key Features:**
- ⭐ Simple 1-5 star rating
- � Title and comment
- ✅ Verification status
- � Helpful votes

### 5. Vendor Model (`vendors.models.js`)

**Basic vendor management**

**Key Features:**

- � Essential vendor information
- � Location details
- 📞 Contact information
- ⭐ Simple rating system

### 6. Chat Model (`chat.models.js`)

**Simple messaging system**

**Key Features:**

- � Basic text messaging
- 👥 Participant management
- ⏰ Timestamps
- 🔍 Message search

### 7. Notification Model (`notification.models.js`)

**Essential notification system**

**Key Features:**

- � Basic notification types
- � Read/unread status
- 🔗 Related entity linking
- 📊 Simple counts

## � Utility Models

### 8. Wishlist Model (`wishlist.models.js`)

**Simple wishlist functionality**

**Features:**

- ❤️ Add/remove items
- � Item listing
- � User-specific lists

### 9. Activity Log Model (`activityLog.models.js`)

**Basic activity tracking**

**Features:**

- 📝 Essential activity types
- � User activity history
- ⏰ Auto-cleanup (6 months)

### 10. Report Model (`report.models.js`)

**Content moderation basics**

**Features:**

- � Report types
- � Simple workflow
- ⚖️ Basic moderation

### 11. Analytics Model (`analytics.models.js`)

**Basic metrics tracking**

**Features:**

- � Core metric types
- � Simple statistics
- ⏰ Data retention (1 year)

### 12. Settings Model (`settings.models.js`)

**Simple configuration**

**Features:**

- ⚙️ Key-value storage
- � Category organization
- 🔍 Easy retrieval
- 📱 Mobile-optimized

## 🛠️ Setup

1. **Install Dependencies**

```bash
npm install mongoose bcryptjs
```

2. **Environment Variables**

```env
MONGODB_URI=mongodb://localhost:27017/campus_marketplace
```

3. **Initialize Database**

```javascript
import mongoose from "mongoose";

await mongoose.connect(process.env.MONGODB_URI);
```

## 💡 Usage Examples

### Basic User Registration

```javascript
import { User } from "./models/index.js";

const user = new User({
  name: "John Doe",
  username: "johndoe",
  email: "john@iitbhilai.ac.in",
  password: "securepassword",
  academicInfo: {
    studentId: "220101001",
    department: "CSE",
    year: "2nd",
  },
  hostelLocation: {
    hostel: "kanhar",
    room: "A-101",
  },
});

await user.save();
```

### Creating a Listing

```javascript
import { Listing } from "./models/index.js";

const listing = new Listing({
  title: "iPhone 13 Pro - Excellent Condition",
  description: "Barely used iPhone 13 Pro with original box",
  price: 75000,
  category: "electronics",
  condition: "like-new",
  images: ["image1.jpg", "image2.jpg"],
  location: {
    hostel: "kanhar",
    pickup: "Main Gate",
  },
  owner: userId,
});

await listing.save();
```

### Processing an Order

```javascript
import { Order } from "./models/index.js";

const order = new Order({
  buyer: buyerId,
  seller: sellerId,
  listing: listingId,
  quantity: 1,
  pricing: {
    itemPrice: 75000,
    deliveryFee: 0,
    total: 75000,
  },
  deliveryMethod: "pickup",
  paymentMethod: "upi",
});

await order.save();
```

### Recording Analytics

```javascript
import { Analytics } from "./models/index.js";

// Track user registration
await Analytics.recordMetric("user_registration", {
  userId: userId,
});

// Get basic stats
const stats = await Analytics.getBasicStats();
```

## 🏗️ Architecture Benefits

- **Simple & Maintainable**: Clean, focused models without unnecessary complexity
- **Production Ready**: Essential features for a working marketplace
- **Extensible**: Easy to add features when needed
- **Performance Optimized**: Strategic indexing for common queries
- **Security Focused**: Built-in validation and secure practices

## 🤝 Contributing

When extending these models:

1. Keep it simple and focused
2. Add appropriate indexes
3. Include basic validation
4. Test thoroughly
5. Update documentation
