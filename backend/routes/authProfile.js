import express from "express";
import jwt from "jsonwebtoken";

import passport from "../config/passport";
import User from "../models/User";

/* import { upload } from "../config/multer"; */
/* import { authenticate } from "passport"; */

const router = express.Router();

// Function to generate JWT access token
const generateAccessToken = (userId) => {
  try {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Token generation failed");
  }
};

// Middleware to athenticate the token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log("Authorization header:", authHeader);
  console.log("Token:", token);

  if (token == null) {
    return res.status(401).json({ error: "Token is missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token is invalid" });
    }
    req.user = user;
    next();
  });
};

// Route to register a new user
router.post("/users", async (req, res) => {
  console.log("POST /users called");
  const { username, password, role } = req.body;

  // Check if the password meets the minimum length requirement
  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters long" });
  }

  try {
    const newUser = new User({ username, password, role });
    await newUser.save();
    const accessToken = generateAccessToken(newUser._id);
    res.status(201).json({ id: newUser._id, accessToken });
  } catch (error) {
    console.error("Error registering user:", error);
    if (error.code === 11000) {
      res.status(400).json({ error: "Username already exists" });
    } else {
      res.status(500).json({ error: "Something went wrong" });
    }
  }
});

router.post("/sessions", async (req, res, next) => {
  console.log("Incoming login request:", req.body);

  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      console.log("Error during authentication:", err);
      return res
        .status(400)
        .json({ error: info ? info.message : "Login failed" });
    }
    req.login(user, { session: false }, async (err) => {
      if (err) {
        console.log("Login error:", err);
        return res.send(err);
      }

      const token = generateAccessToken(user._id); // Generating token here

      // Remove accessToken from user object
      const userWithoutAccessToken = user.toObject();
      delete userWithoutAccessToken.accessToken;

      console.log("Login successful:", user.username);
      return res.json({ user: userWithoutAccessToken, token });  // Sending token in response
    });
  })(req, res, next);
});


// Route for the current session (logged-in user)
router.get("/session", authenticateToken, async (req, res) => {
  try {
    // Retrieve user information from the request object
    const user = req.user;

    // Fetch user data from the database
    const loggedInUser = await User.findById(user.userId).select("-password");

    // Check if the user exists
    if (!loggedInUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Respond with user data
    res.json(loggedInUser);
  } catch (error) {
    console.error("Error fetching logged-in user:", error);
    res.status(500).json({ error: "Failed to fetch logged-in user" });
  }
});

// Route to fetch profile
router.get("/profile", authenticateToken, async (req, res) => {
  console.log("GET /profile called");
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

//Update user profile
router.put(
  "/profile",
  authenticateToken,
  async (req, res) => {
    try {
      const { name, bio, hobby } = req.body;
      const updatedData = { name, bio, hobby };

      // Log the update data to debug
      console.log("Updating user profile with data:", updatedData);

      const user = await User.findByIdAndUpdate(req.user.userId, updatedData, {
        new: true,
      });
      // Log the updated user to debug
      console.log("Updated user profile:", user);


      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
);

// Authenticated endpoint
router.get("/secrets", authenticateToken, (req, res) => {
  res.json({ secret: "This is secret content" });
});

export default router;
