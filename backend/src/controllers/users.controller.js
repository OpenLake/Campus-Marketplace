// users.controller.js - FIXED VERSION

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { 
  findUserByEmail, 
  findUserByEmailWithPassword,
  findUserById,
  createUserWithPassword,
  saveRefreshToken,
  deleteRefreshToken,
  findRefreshToken,
  updateUser,
} from "../models/users.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPool } from "../db/pgConnect.js";

// Helper to generate tokens and set cookies
const generateTokensAndSetCookies = async (res, user) => {
  try {
    // Access token (short-lived)
    const accessToken = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
    );

    // Refresh token (long-lived)
    const refreshToken = jwt.sign(
      { user_id: user.user_id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
    );

    // Store refresh token in database
    await saveRefreshToken(user.user_id, refreshToken, 7);

    // Set HTTP‑only cookies
    const isProduction = process.env.NODE_ENV === "production";
    
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError(500, "Failed to generate tokens");
  }
};

// ========== REGISTER ==========
export const registerUser = asyncHandler(async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone_number, role } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, email and password are required"
      });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await createUserWithPassword({
      email,
      first_name,
      last_name,
      phone_number,
      role: role || 'student',
      password_hash,
    });

    // Log user in automatically (set cookies)
    await generateTokensAndSetCookies(res, newUser);

    return res.status(201).json({
      success: true,
      user: newUser,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Registration failed"
    });
  }
});

// ========== LOGIN ==========
export const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await findUserByEmailWithPassword(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Remove sensitive data before sending
    delete user.password_hash;

    // Set cookies
    await generateTokensAndSetCookies(res, user);

    return res.json({ 
      success: true,
      user, 
      message: "Login successful" 
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Login failed"
    });
  }
});

// ========== LOGOUT ==========
export const logoutUser = asyncHandler(async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      await deleteRefreshToken(refreshToken);
    }

    res.clearCookie("accessToken", { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production" 
    });
    res.clearCookie("refreshToken", { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production" 
    });

    return res.json({ 
      success: true,
      message: "Logged out successfully" 
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Logout failed"
    });
  }
});

// ========== REFRESH TOKEN ==========
export const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required"
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token"
      });
    }

    // Check if token exists in database
    const storedToken = await findRefreshToken(refreshToken);
    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found"
      });
    }

    // Get user
    const user = await findUserById(decoded.user_id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({ 
      success: true,
      message: "Access token refreshed" 
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
});

// ========== GET CURRENT USER ==========
export const getCurrentUser = (req, res) => {
  try {
    // req.user is set by verifyJWT middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    
    return res.json({ 
      success: true,
      user: req.user 
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// ========== UPDATE PROFILE ==========
export const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const allowedUpdates = ['first_name', 'last_name', 'phone_number', 'avatar'];
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update"
      });
    }

    const updatedUser = await updateUser(req.user.user_id, updates);
    return res.json({ 
      success: true,
      user: updatedUser, 
      message: "Profile updated successfully" 
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Update failed"
    });
  }
});

// ========== ADMIN FUNCTIONS ==========
export const listUsers = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const pool = getPool();
    let query = 'SELECT user_id, email, first_name, last_name, phone_number, role, is_verified, avatar, created_at FROM users';
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(email ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }
    if (role) {
      conditions.push(`role = $${paramIndex}`);
      values.push(role);
      paramIndex++;
    }
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1);
    values.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const result = await pool.query(query, values);
    
    // Count total
    let countQuery = 'SELECT COUNT(*) FROM users';
    if (conditions.length) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = await pool.query(countQuery, values.slice(0, paramIndex - 1));
    const total = parseInt(countResult.rows[0].count);

    return res.json({
      success: true,
      users: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1,
      }
    });
  } catch (error) {
    console.error("List users error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to list users"
    });
  }
});

export const deleteUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const result = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING user_id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    return res.json({ 
      success: true,
      message: "User deleted successfully" 
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete user"
    });
  }
});