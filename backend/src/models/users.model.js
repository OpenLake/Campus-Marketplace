import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { supabase } from "../db/supabaseClient.js";
 
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ==================== HELPER: Generate tokens and set cookies ====================
const generateTokensAndSetCookies = async (res, user) => {
  const accessToken = jwt.sign(
    { user_id: user.user_id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  );

  const refreshToken = jwt.sign(
    { user_id: user.user_id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );

  await saveRefreshToken(user.user_id, refreshToken, 7);

  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { accessToken, refreshToken };
};

export const registerUser = asyncHandler(async (req, res) => {
  const { first_name, last_name, email, password, phone_number, role } = req.body;
  if (!first_name || !last_name || !email || !password) throw new ApiError(400, "Required fields missing");

  const existingUser = await findUserByEmail(email);
  if (existingUser) throw new ApiError(409, "User with this email already exists");

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const newUser = await createUserWithPassword({
    email, first_name, last_name, phone_number, role: role || "student", password_hash,
  });

  await generateTokensAndSetCookies(res, newUser);
  res.status(201).json(new ApiResponse(201, newUser, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password are required");

  const user = await findUserByEmailWithPassword(email);
  if (!user) throw new ApiError(401, "Invalid credentials");

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) throw new ApiError(401, "Invalid credentials");

  delete user.password_hash;
  await generateTokensAndSetCookies(res, user);

  res.status(200).json(new ApiResponse(200, user, "Login successful"));
});

export const logoutUser = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) await deleteRefreshToken(refreshToken);
  res.clearCookie("accessToken", { httpOnly: true, secure: process.env.NODE_ENV === "production" });
  res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === "production" });
  res.status(200).json(new ApiResponse(200, {}, "Logged out successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) throw new ApiError(401, "Refresh token required");

  let decoded;
  try { decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET); } 
  catch (error) { throw new ApiError(401, "Invalid or expired refresh token"); }

  const storedToken = await findRefreshToken(refreshToken);
  if (!storedToken) throw new ApiError(401, "Refresh token not found");

  const user = await findUserById(decoded.user_id);
  if (!user) throw new ApiError(401, "User not found");

  const newAccessToken = jwt.sign(
    { user_id: user.user_id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  );
  res.cookie("accessToken", newAccessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 24 * 60 * 60 * 1000 });
  res.status(200).json(new ApiResponse(200, {}, "Access token refreshed"));
});

export const getCurrentUser = (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user, "Current user fetched"));
};

export const updateUserProfile = asyncHandler(async (req, res) => {
  const allowedUpdates = ["first_name", "last_name", "phone_number", "avatar"];
  const updates = {};
  allowedUpdates.forEach((field) => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

  if (Object.keys(updates).length === 0) throw new ApiError(400, "No valid fields to update");
  const updatedUser = await updateUser(req.user._id, updates);
  res.status(200).json(new ApiResponse(200, updatedUser, "Profile updated"));
});

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await findUserById(id, false);
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json(new ApiResponse(200, user, "User profile fetched"));
});

export const listUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role } = req.query;
  let query = supabase.from('users').select('user_id, email, first_name, last_name, phone_number, role, is_verified, avatar, created_at', { count: 'exact' });

  if (role) query = query.eq('role', role);
  if (search) query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
  
  query = query.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1);
  const { data, count, error } = await query;
  if (error) throw new ApiError(500, error.message);

  res.status(200).json(new ApiResponse(200, data, "Users fetched", {
    currentPage: parseInt(page),
    totalPages: Math.ceil(count / limit),
    totalUsers: count,
    hasNext: page < Math.ceil(count / limit),
    hasPrev: page > 1,
  }));
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('users').delete().eq('user_id', id).select();
  if (error) throw new ApiError(500, error.message);
  if (!data || data.length === 0) throw new ApiError(404, "User not found");
  res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"));
});

export const updateUserRoles = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { roles } = req.body;
  if (!roles || !Array.isArray(roles) || roles.length === 0) throw new ApiError(400, "Valid roles array is required");

  const { data, error } = await supabase.from('users').update({ role: roles[0] }).eq('user_id', id).select('user_id, email, first_name, last_name, role');
  if (error) throw new ApiError(500, error.message);
  if (!data || data.length === 0) throw new ApiError(404, "User not found");
  res.status(200).json(new ApiResponse(200, data[0], "User role updated"));
});

// ========== BASIC USER QUERIES ==========
export const findUserByEmail = async (email) => {
  const { data } = await supabase.from('users').select('*').eq('email', email).single();
  return data || null;
};

export const findUserByGoogleId = async (googleId) => {
  const { data } = await supabase.from('users').select('*').eq('google_id', googleId).single();
  return data || null;
};

export const findUserById = async (userId, includePassword = false) => {
  const fields = includePassword ? '*' : 'user_id, email, first_name, last_name, phone_number, role, is_verified, avatar, google_id, created_at';
  const { data } = await supabase.from('users').select(fields).eq('user_id', userId).single();
  return data || null;
};

export const findUserByEmailWithPassword = async (email) => {
  const { data } = await supabase.from('users').select('user_id, email, first_name, last_name, phone_number, role, is_verified, avatar, google_id, created_at, password_hash').eq('email', email).single();
  return data || null;
};

// ========== CREATE USER ==========
export const createUser = async (userData) => {
  const { email, first_name, last_name, phone_number, role, is_verified, avatar, google_id } = userData;
  const { data, error } = await supabase.from('users').insert([{
    email, first_name, last_name, phone_number, role, is_verified, avatar, google_id
  }]).select();
  if (error) throw new Error(error.message);
  return data[0];
};

export const createUserWithPassword = async (userData) => {
  const { email, first_name, last_name, phone_number, role, password_hash } = userData;
  const { data, error } = await supabase.from('users').insert([{
    email, first_name, last_name, phone_number, role: role || 'student', password_hash, is_verified: false
  }]).select('user_id, email, first_name, last_name, phone_number, role, is_verified, avatar, google_id, created_at');
  if (error) throw new Error(error.message);
  return data[0];
};

// ========== UPDATE USER ==========
export const updateUser = async (userId, updates) => {
  const { data, error } = await supabase.from('users').update(updates).eq('user_id', userId).select();
  if (error) throw new Error(error.message);
  return data[0];
};

// ========== VENDOR PROFILE ==========
export const createVendorProfile = async (vendorData) => {
  const { vendor_id, shop_name, shop_category, shop_description, campus_location, opening_time, closing_time } = vendorData;
  const { data, error } = await supabase.from('vendor_profiles').insert([{
    vendor_id, shop_name, shop_category, shop_description, campus_location, opening_time, closing_time
  }]).select();
  if (error) throw new Error(error.message);
  return data[0];
};

// ========== REFRESH TOKEN MANAGEMENT ==========
export const saveRefreshToken = async (userId, token, expiresInDays = 7) => {
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from('refresh_tokens').insert([{ user_id: userId, token, expires_at: expiresAt }]);
};

export const deleteRefreshToken = async (token) => {
  await supabase.from('refresh_tokens').delete().eq('token', token);
};

export const findRefreshToken = async (token) => {
  const { data } = await supabase.from('refresh_tokens').select('*').eq('token', token).gt('expires_at', new Date().toISOString()).single();
  return data || null;
};
