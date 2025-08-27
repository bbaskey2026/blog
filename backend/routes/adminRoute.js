import express from "express";
import verifyAdminByEmail from "../middleware/verifyAdminByEmail.js";
import User from "../models/User.js";

const router = express.Router();

// This route is now admin-only

router.get("/users",verifyAdminByEmail , async (req, res) => {
  try {
    const users = await User.find({}, "name email lastLogin role createdAt");
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
