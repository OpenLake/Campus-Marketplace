// src/controllers/googleAuth.controller.js
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser } from "../models/users.model.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleSignIn = async (req, res) => {
  try {
    const { credential } = req.body;
    console.log("BODY RECEIVED:", req.body);

    if (!credential) {
      return res.status(400).json({ message: "Google token required" });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture, sub } = payload;

    // Check if user exists in PostgreSQL
    let user = await findUserByEmail(email);

    if (!user) {
      // New user - return temp token for registration
      const tempPayload = {
        email,
        firstName: given_name || "",
        lastName: family_name || "",
        avatar: picture,
        googleId: sub,
      };
      
      const tempToken = jwt.sign(
        tempPayload, 
        process.env.TEMP_TOKEN_SECRET, 
        { expiresIn: "15m" }
      );

      return res.status(200).json({
        requiresDetails: true,
        tempToken,
        message: "Please complete your registration",
      });
    }

    // Existing user - log them in
    const accessToken = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .json({ user, accessToken });

  } catch (error) {
    console.error("VERIFICATION ERROR:", error);
    res.status(401).json({ message: "Google authentication failed" });
  }
};

// Complete registration for new users
export const completeGoogleSignup = async (req, res) => {
  try {
    const { tempToken, first_name, last_name, phone_number, role } = req.body;

    if (!tempToken) {
      return res.status(400).json({ message: "Temporary token required" });
    }

    // Verify temp token
    let googleData;
    try {
      googleData = jwt.verify(tempToken, process.env.TEMP_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Check if user was created in the meantime
    const existingUser = await findUserByEmail(googleData.email);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Validate student email
    if (role === 'student' && !googleData.email.endsWith('@iitbhilai.ac.in')) {
      return res.status(400).json({ 
        message: "Students must use @iitbhilai.ac.in email" 
      });
    }

    // Create user in PostgreSQL
    const newUser = await createUser({
      email: googleData.email,
      first_name,
      last_name,
      phone_number,
      role,
      is_verified: true,
      avatar: googleData.avatar,
      google_id: googleData.googleId,
    });

    // Generate access token
    const accessToken = jwt.sign(
      { user_id: newUser.user_id, role: newUser.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .status(201)
      .json({ user: newUser, accessToken });

  } catch (error) {
    console.error("Complete signup error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};