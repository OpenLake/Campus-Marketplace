import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getPool } from "../db/pgConnect.js";
 
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ==================== HELPER: Generate tokens and set cookies ====================
const generateTokensAndSetCookies = async (res, user) => {
  // Access token – short-lived (e.g., 1 day)
  const accessToken = jwt.sign(
    { user_id: user.user_id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  );

  // Refresh token – long-lived (e.g., 7 days)
  const refreshToken = jwt.sign(
    { user_id: user.user_id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );

  // Store refresh token in database (for rotation/revocation)
  await saveRefreshToken(user.user_id, refreshToken, 7);

  // Cookie options – httpOnly and secure in production
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return { accessToken, refreshToken };
};

// ==================== REGISTER (Email/Password) ====================
export const registerUser = asyncHandler(async (req, res) => {
  const { first_name, last_name, email, password, phone_number, role } = req.body;

  if (!first_name || !last_name || !email || !password) {
    throw new ApiError(400, "First name, last name, email and password are required");
  }

  // Check if user exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
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
    role: role || "student",
    password_hash,
  });

  // (Optional) Send verification email here...

  // Auto‑login: set cookies
  await generateTokensAndSetCookies(res, newUser);

  res.status(201).json(
    new ApiResponse(201, newUser, "User registered successfully")
  );
});

// ==================== LOGIN ====================
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await findUserByEmailWithPassword(email);
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Remove sensitive data
  delete user.password_hash;

  // Set cookies
  await generateTokensAndSetCookies(res, user);

  res.status(200).json(
    new ApiResponse(200, user, "Login successful")
  );
});

// ==================== LOGOUT ====================
export const logoutUser = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    await deleteRefreshToken(refreshToken);
  }

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json(
    new ApiResponse(200, {}, "Logged out successfully")
  );
});

// ==================== REFRESH ACCESS TOKEN ====================
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token required");
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  // Check if token exists in database
  const storedToken = await findRefreshToken(refreshToken);
  if (!storedToken) {
    throw new ApiError(401, "Refresh token not found");
  }

  // Get user
  const user = await findUserById(decoded.user_id);
  if (!user) {
    throw new ApiError(401, "User not found");
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

  res.status(200).json(
    new ApiResponse(200, {}, "Access token refreshed")
  );
});

// ==================== GET CURRENT USER ====================
export const getCurrentUser = (req, res) => {
  // req.user is set by verifyJWT middleware
  res.status(200).json(
    new ApiResponse(200, req.user, "Current user fetched")
  );
};

// ==================== UPDATE PROFILE ====================
export const updateUserProfile = asyncHandler(async (req, res) => {
  const allowedUpdates = ["first_name", "last_name", "phone_number", "avatar"];
  const updates = {};
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields to update");
  }

  const updatedUser = await updateUser(req.user._id, updates);
  res.status(200).json(
    new ApiResponse(200, updatedUser, "Profile updated")
  );
});

// ==================== GET USER BY ID (Public Profile) ====================
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await findUserById(id, false);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.status(200).json(
    new ApiResponse(200, user, "User profile fetched")
  );
});

// ==================== ADMIN: LIST USERS ====================
export const listUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role } = req.query;
  const pool = getPool();
  let query = `
    SELECT user_id, email, first_name, last_name, phone_number, role, is_verified, avatar, created_at
    FROM users
  `;
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
    query += " WHERE " + conditions.join(" AND ");
  }
  query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  values.push(limit, (page - 1) * limit);

  const result = await pool.query(query, values);

  // Count total (for pagination)
  let countQuery = "SELECT COUNT(*) FROM users";
  if (conditions.length) {
    countQuery += " WHERE " + conditions.join(" AND ");
  }
  const countResult = await pool.query(countQuery, values.slice(0, paramIndex - 1));
  const total = parseInt(countResult.rows[0].count);

  res.status(200).json(
    new ApiResponse(200, result.rows, "Users fetched", {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    })
  );
});

// ==================== ADMIN: DELETE USER ====================
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const pool = getPool();
  const result = await pool.query("DELETE FROM users WHERE user_id = $1 RETURNING user_id", [id]);
  if (result.rowCount === 0) {
    throw new ApiError(404, "User not found");
  }
  res.status(200).json(
    new ApiResponse(200, {}, "User deleted successfully")
  );
});

// ==================== ADMIN: UPDATE USER ROLES ====================
export const updateUserRoles = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { roles } = req.body; // expecting an array, e.g., ["admin", "vendor"]

  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    throw new ApiError(400, "Valid roles array is required");
  }

  // In PostgreSQL, `role` is a single string. We'll convert the first role to the main role,
  // but you might want to store multiple roles in a separate table. For simplicity, we'll just set the first.
  const mainRole = roles[0];
  const pool = getPool();
  const result = await pool.query(
    "UPDATE users SET role = $1 WHERE user_id = $2 RETURNING user_id, email, first_name, last_name, role",
    [mainRole, id]
  );
  if (result.rowCount === 0) {
    throw new ApiError(404, "User not found");
  }
  res.status(200).json(
    new ApiResponse(200, result.rows[0], "User role updated")
  );
});

// ========== BASIC USER QUERIES ==========
export const findUserByEmail = async (email) => {
  const pool = getPool();
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
};

export const findUserByGoogleId = async (googleId) => {
  const pool = getPool();
  const result = await pool.query(
    'SELECT * FROM users WHERE google_id = $1',
    [googleId]
  );
  return result.rows[0] || null;
};

export const findUserById = async (userId, includePassword = false) => {
  const pool = getPool();
  const fields = includePassword 
    ? '*' 
    : 'user_id, email, first_name, last_name, phone_number, role, is_verified, avatar, google_id, created_at';
  const result = await pool.query(
    `SELECT ${fields} FROM users WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0] || null;
};

export const findUserByEmailWithPassword = async (email) => {
  const pool = getPool();
  const result = await pool.query(
    'SELECT user_id, email, first_name, last_name, phone_number, role, is_verified, avatar, google_id, created_at, password_hash FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
};

// ========== CREATE USER ==========
export const createUser = async (userData) => {
  const pool = getPool();
  const { 
    email, 
    first_name, 
    last_name, 
    phone_number, 
    role, 
    is_verified, 
    avatar, 
    google_id 
  } = userData;
  
  const result = await pool.query(
    `INSERT INTO users 
     (email, first_name, last_name, phone_number, role, is_verified, avatar, google_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [email, first_name, last_name, phone_number, role, is_verified, avatar, google_id]
  );
  return result.rows[0];
};

export const createUserWithPassword = async (userData) => {
  const pool = getPool();
  const { email, first_name, last_name, phone_number, role, password_hash } = userData;
  const result = await pool.query(
    `INSERT INTO users (email, first_name, last_name, phone_number, role, password_hash, is_verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING user_id, email, first_name, last_name, phone_number, role, is_verified, avatar, google_id, created_at`,
    [email, first_name, last_name, phone_number, role || 'student', password_hash, false]
  );
  return result.rows[0];
};

// ========== UPDATE USER ==========
export const updateUser = async (userId, updates) => {
  const pool = getPool();
  const setClause = Object.keys(updates)
    .map((key, index) => `${key} = $${index + 2}`)
    .join(', ');
  const values = [userId, ...Object.values(updates)];
  const result = await pool.query(
    `UPDATE users SET ${setClause} WHERE user_id = $1 RETURNING *`,
    values
  );
  return result.rows[0];
};

// ========== VENDOR PROFILE ==========
export const createVendorProfile = async (vendorData) => {
  const pool = getPool();
  const { 
    vendor_id, 
    shop_name, 
    shop_category, 
    shop_description,
    campus_location, 
    opening_time, 
    closing_time 
  } = vendorData;
  const result = await pool.query(
    `INSERT INTO vendor_profiles 
     (vendor_id, shop_name, shop_category, shop_description, campus_location, opening_time, closing_time)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [vendor_id, shop_name, shop_category, shop_description, campus_location, opening_time, closing_time]
  );
  return result.rows[0];
};

// ========== REFRESH TOKEN MANAGEMENT ==========
export const saveRefreshToken = async (userId, token, expiresInDays = 7) => {
  const pool = getPool();
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );
};

export const deleteRefreshToken = async (token) => {
  const pool = getPool();
  await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
};

export const findRefreshToken = async (token) => {
  const pool = getPool();
  const result = await pool.query(
    'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
    [token]
  );
  return result.rows[0] || null;
};