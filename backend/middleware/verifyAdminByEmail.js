import jwt from "jsonwebtoken";
import User from "../models/User.js";

const ADMIN_EMAILS = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(",") // convert comma-separated string to array
  : [];

const verifyAdminByEmail = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    if (!ADMIN_EMAILS.includes(user.email)) {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    req.user = user; // attach admin user to request
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid token" });
  }
};

export default verifyAdminByEmail;
