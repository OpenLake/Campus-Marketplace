# Campus Marketplace Backend

Backend API for the Campus Marketplace application built with Node.js, Express, and MongoDB.

## Features

- User Authentication & Authorization (RBAC)
- Listing Management (CRUD operations)
- File Upload with Cloudinary
- Order Management
- Reviews & Ratings
- Real-time Chat
- Analytics & Reporting
- Email Notifications

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Validation**: Express Validator

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Cloudinary account (for file uploads)

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your configuration

4. Start the development server:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:8000`

## API Endpoints

### Authentication

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `POST /api/users/logout` - Logout user
- `POST /api/users/refresh-token` - Refresh access token

### Listings

- `GET /api/listings` - Get all listings
- `POST /api/listings` - Create new listing
- `GET /api/listings/:id` - Get listing by ID
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID

### Orders

- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   ├── validators/     # Request validators
│   ├── app.js          # Express app configuration
│   └── index.js        # Server entry point
├── public/             # Static files
├── .env               # Environment variables
└── package.json       # Dependencies
```

## Environment Variables

See `.env` file for all required environment variables.
