import express from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import {auth}from "../middleware/auth.js"
const router = express.Router();
router.get("/me", auth, async (req, res) => {
  try {
    const userId = req.user.id; // user id from token
    const user = await User.findById(userId).select("name email bio"); // select fields you want to return
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/update-profile", auth, async (req, res) => {
  const { name, bio } = req.body;

  if (!name) return res.status(400).json({ message: "Name is required" });

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Profile updated successfully",
      name: updatedUser.name,
      bio: updatedUser.bio,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Registration route
router.post(
  "/register",
  body("name").notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      // Destructure interestedTopics from body
      const { name, email, password, interestedTopics } = req.body;

      console.log("Received interestedTopics:", interestedTopics); // ✅ Debug

      // Check if user already exists
      const exists = await User.findOne({ email });
      if (exists)
        return res.status(409).json({ message: "Email already registered" });

      // Create user with interestedTopics (ensure array)
      const user = await User.create({
        name,
        email,
        password,
        interestedTopics: Array.isArray(interestedTopics)
          ? interestedTopics
          : [],
      });

      console.log("Saved user interestedTopics:", user.interestedTopics); // ✅ Debug

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(201).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          interestedTopics: user.interestedTopics,
        },
        token,
      });
    } catch (e) {
      next(e);
    }
  }
);

// Login route
router.post(
  "/login",
  body("email").isEmail(),
  body("password").notEmpty(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      const ok = await user.comparePassword(password);
      if (!ok) return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      console.log("Login interestedTopics:", user.interestedTopics); // ✅ Debug

      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          interestedTopics: user.interestedTopics,
        },
        token,
      });
    } catch (e) {
      next(e);
    }
  }
);



export default router;
