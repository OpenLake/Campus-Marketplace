-- src/db/init.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table (Source of Truth)
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(15) UNIQUE,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'vendor', 'admin', 'faculty')),
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    avatar TEXT,
    google_id VARCHAR(100) UNIQUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: Students must use @iitbhilai.ac.in
    CONSTRAINT check_student_email 
    CHECK (role = 'student' OR email LIKE '%@iitbhilai.ac.in')
);

-- 2. Vendor profiles table (only for users with role = 'vendor')
CREATE TABLE IF NOT EXISTS vendor_profiles (
    vendor_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    shop_name VARCHAR(100) NOT NULL,
    shop_category VARCHAR(50),
    shop_description TEXT,
    campus_location VARCHAR(100),
    opening_time TIME,
    closing_time TIME,
    is_accepting_orders BOOLEAN DEFAULT true,
    average_rating DECIMAL(2,1) DEFAULT 0.0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Addresses table
CREATE TABLE IF NOT EXISTS addresses (
    address_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    address_label VARCHAR(20),
    hostel_name VARCHAR(50),
    room_number VARCHAR(20),
    is_default BOOLEAN DEFAULT false,
    pincode VARCHAR(10) DEFAULT '491001',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS refresh_tokens (
    token_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_category ON vendor_profiles(shop_category);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- Create refresh_tokens table (if you want refresh token rotation)
 
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX  IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX  IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);