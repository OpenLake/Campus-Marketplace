import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { User } from "../models/users.model.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleSignIn = async (req, res) => {
  try {
    const { credential } = req.body;
console.log("BODY RECEIVED:", req.body); // Check if 'credential' actually exists
    if (!credential) {
      return res.status(400).json({ message: "Google token required" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name, picture, sub } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        username: name,
        avatar: picture,
        googleId: sub,
        roles: ["user"],
        isVerified: true,
      });
    }

    const accessToken = jwt.sign(
      { _id: user._id, roles: user.roles },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
      })
      .json({ user, accessToken });

  } catch (error) {
    console.error("VERIFICATION ERROR:", error); // This will print the EXACT reason Google rejected the token
    res.status(401).json({ message: "Google authentication failed" });
  }
};
