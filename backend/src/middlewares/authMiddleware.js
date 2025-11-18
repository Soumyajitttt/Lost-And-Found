import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
 
const adminEmails = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(",").map(e => e.trim())
  : [];

// Protect routes: must be logged in
export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized — token missing");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Special handling for predefined admin from .env
    if (decoded.id === "admin-fixed-id") {
      req.user = {
        _id: "admin-fixed-id",
        name: "Admin User",
        email: decoded.email || adminEmails[0], // get email from token if available
        role: "admin"
      };
      return next();
    }

    // Normal DB lookup for students/teachers
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401);
      throw new Error("Not authorized — user not found");
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized — invalid token");
  }
});

// Admin-only middleware: must already be authenticated
// This should be at the end of the file

// Protect routes: must be admin
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403); // Forbidden
    throw new Error('Not authorized as an admin');
  }
};

