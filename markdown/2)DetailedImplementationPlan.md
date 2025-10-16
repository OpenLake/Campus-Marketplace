# Campus Marketplace - Detailed Implementation Plan

_A comprehensive roadmap for backend and frontend development_

---

## 🎯 Project Current State Analysis

### ✅ **Already Implemented (Foundation)**

- **User Authentication System**: Complete registration, login, JWT tokens, RBAC
- **Database Models**: Well-defined schemas for all entities
- **Project Structure**: Professional Node.js/Express structure with proper organization
- **Middleware**: Authentication, error handling, async wrappers
- **Utilities**: API response handlers, error classes

### 🚧 **Partially Implemented**

- **Controller Files**: Created but mostly empty (ready for implementation)
- **Route Files**: Basic structure exists
- **Frontend**: Basic HTML structure (needs complete implementation)

---

## 🏗️ PHASE 1: Core Backend Implementation (2-3 Weeks)

### Essential Marketplace Features

#### **1) Listing Management System**

**Backend Implementation:**

**`listing.controller.js` - Complete Implementation**

```javascript
// Core Functions to Implement:
-createListing() - // Create new marketplace listings with validation
  getAllListings() - // Get listings with pagination, search, filters
  getListingById() - // Get detailed listing information
  updateListing() - // Update listing details (owner only)
  deleteListing() - // Soft delete listings (owner/admin only)
  getUserListings() - // Get all listings by specific user
  searchListings() - // Advanced search with filters
  toggleListingStatus() - // Active/inactive toggle
  getListingStats(); // Basic analytics for listing
```

**Key Features:**

- **Image Handling**: Multiple image URLs with validation
- **Location Filtering**: Hostel-based and campus pickup points
- **Category Management**: Books, electronics, cycles, hostel items, etc.
- **Condition Tracking**: New, like-new, good, fair, poor
- **Price History**: Track price changes over time
- **View Counter**: Track listing popularity
- **Expiry Management**: Auto-expire old listings
- **Search Optimization**: Text search across title, description, tags

**`listing.routes.js` - RESTful API Routes**

```javascript
// Public Routes
GET    /api/listings              // Browse all listings
GET    /api/listings/:id          // Get specific listing
GET    /api/listings/search       // Advanced search
GET    /api/listings/categories   // Get all categories

// Protected Routes (Authentication Required)
POST   /api/listings              // Create new listing
PUT    /api/listings/:id          // Update listing (owner only)
DELETE /api/listings/:id          // Delete listing (owner/admin)
GET    /api/listings/user/:userId // Get user's listings
POST   /api/listings/:id/toggle   // Toggle listing status
```

#### **2) Order Management System**

**Backend Implementation:**

**`order.controller.js` - Complete Order Lifecycle**

```javascript
// Core Functions:
-createOrder() - // Place new orders with validation
  getOrderById() - // Get detailed order information
  getUserOrders() - // Get orders for buyer/seller
  updateOrderStatus() - // Update order status (seller/admin)
  cancelOrder() - // Cancel orders with business logic
  getOrderHistory() - // Complete order history
  getOrderStats() - // Order statistics for users
  processPayment() - // Handle payment processing
  confirmDelivery(); // Mark order as delivered
```

**Order Status Workflow:**

```
pending → confirmed → in_transit → delivered → completed
    ↓         ↓            ↓           ↓
cancelled cancelled   cancelled   disputed
```

**Key Features:**

- **Order Validation**: Check listing availability, price consistency
- **Payment Tracking**: Multiple payment methods (UPI, cash, etc.)
- **Delivery Options**: Campus pickup, hostel delivery, meet-in-person
- **Cancellation Rules**: Time-based cancellation policies
- **Order Notes**: Communication between buyer and seller
- **Bulk Orders**: Support for quantity > 1

**`order.routes.js` - Order Management Routes**

```javascript
// Protected Routes
POST   /api/orders                    // Create new order
GET    /api/orders/:id                // Get order details
GET    /api/orders/user/buyer         // Buyer's orders
GET    /api/orders/user/seller        // Seller's orders
PUT    /api/orders/:id/status         // Update order status
POST   /api/orders/:id/cancel         // Cancel order
GET    /api/orders/history            // Order history
POST   /api/orders/:id/confirm        // Confirm delivery
```

#### **3) Review & Rating System**

**Backend Implementation:**

**`review.controller.js` - Comprehensive Review System**

```javascript
// Core Functions:
-createReview() - // Create reviews with purchase verification
  getReviewsForListing() - // Get all reviews for a listing
  getReviewsForUser() - // Get reviews for user (as seller)
  updateReview() - // Update review (reviewer only)
  deleteReview() - // Delete review (reviewer/admin)
  markReviewHelpful() - // Vote on review helpfulness
  getReviewStats() - // Rating statistics and aggregation
  reportReview() - // Report inappropriate reviews
  respondToReview(); // Seller response to reviews
```

**Multi-Criteria Rating System:**

- **Item Quality** (1-5 stars): Condition as described, functionality
- **Seller Communication** (1-5 stars): Responsiveness, clarity
- **Delivery Experience** (1-5 stars): Timeliness, meeting arrangements
- **Overall Rating** (1-5 stars): General satisfaction

**Key Features:**

- **Purchase Verification**: Only buyers who completed orders can review
- **Helpful Voting**: Community can vote on review helpfulness
- **Rating Aggregation**: Calculate average ratings for users and listings
- **Review Moderation**: Flag and moderate inappropriate content
- **Seller Responses**: Allow sellers to respond to reviews
- **Review Analytics**: Track review trends and patterns

#### **4) User Profile Enhancement**

**Backend Updates:**

**Enhanced `users.controller.js`**

```javascript
// Additional Functions:
-getUserProfile() - // Get complete user profile
  updateUserProfile() - // Update profile information
  getUserStats() - // User activity statistics
  getUserRatings() - // Aggregated user ratings
  updateUserPreferences() - // Notification and app preferences
  getUserActivity() - // Activity log and history
  deactivateAccount() - // Account deactivation
  getUserRecommendations(); // Personalized recommendations
```

---

## 🏗️ PHASE 2: Advanced Backend Features

### **Communication & Vendor Management**

#### **Chat & Communication System**

**Backend Implementation:**

**`chat.controller.js` - Real-time Communication**

```javascript
// Core Functions:
-createOrGetChat() - // Create chat between users or get existing
  sendMessage() - // Send text messages
  getChatMessages() - // Get chat history with pagination
  getUserChats() - // Get all chats for a user
  markMessagesAsRead() - // Mark messages as read
  deleteMessage() - // Delete messages (sender only)
  blockUser() - // Block users from messaging
  reportChat(); // Report inappropriate messages
```

**Key Features:**

- **Text Messaging**: Rich text support with basic formatting
- **Chat Participants**: Validate users can communicate
- **Message History**: Paginated message retrieval
- **Read Receipts**: Track message read status
- **Message Search**: Search within chat conversations
- **File Sharing**: Support for image sharing (URLs initially)
- **Chat Moderation**: Report and block functionality

#### **Vendor Management System**

**Backend Implementation:**

**`vendor.controller.js` - Business Account Management**

```javascript
// Core Functions:
-applyAsVendor() - // Submit vendor application
  getVendorApplication() - // Get application status
  approveVendor() - // Approve applications (admin only)
  rejectVendor() - // Reject applications (admin only)
  getVendorProfile() - // Get vendor business profile
  updateVendorProfile() - // Update vendor information
  getVendorListings() - // Get all listings by vendor
  getVendorOrders() - // Get vendor order history
  getVendorAnalytics() - // Vendor performance metrics
  manageVendorStatus(); // Suspend/activate vendors
```

**Vendor Application Process:**

1. **Application Submission**: Business details, documents, verification
2. **Admin Review**: Manual verification of vendor legitimacy
3. **Approval/Rejection**: Update user roles and permissions
4. **Vendor Onboarding**: Profile setup and initial listing guidelines

**Key Features:**

- **Business Profile**: Store name, description, contact details
- **Verification System**: Document upload and verification
- **Vendor Analytics**: Sales metrics, customer feedback, performance
- **Bulk Operations**: Mass listing management for vendors
- **Commission Tracking**: Future payment processing integration

#### **Notification System**

**Backend Implementation:**

**`notification.controller.js` - Comprehensive Notifications**

```javascript
// Core Functions:
-createNotification() - // Create notifications for users
  getUserNotifications() - // Get user notifications with pagination
  markAsRead() - // Mark individual notifications as read
  markAllAsRead() - // Mark all notifications as read
  deleteNotification() - // Delete notifications
  getNotificationCount() - // Get unread notification count
  updatePreferences() - // Manage notification preferences
  sendBulkNotification(); // Admin bulk notifications
```

**Notification Types:**

- **Order Updates**: Status changes, delivery confirmations
- **Chat Messages**: New message notifications
- **Reviews**: New reviews received, review responses
- **Vendor Updates**: Application status, account changes
- **System Alerts**: Maintenance, policy updates, security alerts
- **Promotional**: Featured listings, discounts, events

#### **Integration & Testing**

- **Cross-Feature Integration**: Ensure all systems work together
- **API Testing**: Comprehensive endpoint testing with Postman
- **Error Handling**: Validate error responses and edge cases
- **Performance Optimization**: Database queries, pagination, caching
- **Security Audit**: Authentication, authorization, data validation

---
