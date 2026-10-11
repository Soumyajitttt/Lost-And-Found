import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const adminEmails = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(",").map(e => e.trim())
  : [];
const adminPasswords = process.env.ADMIN_PASSWORDS
  ? process.env.ADMIN_PASSWORDS.split(",").map(p => p.trim())
  : [];

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Missing fields");
  }

  // Prevent creation of admin via public route
  if (role && role.toLowerCase() === "admin") {
    res.status(403);
    throw new Error("Cannot create admin via this route");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const user = await User.create({ 
    name, 
    email, 
    password: hashed, 
    role: role && ["student", "teacher"].includes(role.toLowerCase()) 
      ? role.toLowerCase() 
      : "student" 
  });

  const token = jwt.sign(
  { id: user._id, email: user.email }, // include email in token
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );


  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Missing fields");
  }

  // Check if email belongs to admin as per env
const adminIndex = adminEmails.findIndex(
  adminEmail => adminEmail.toLowerCase().trim() === email.toLowerCase().trim()
);

  if (adminIndex !== -1) {
    // Simple plaintext password check for admin from env (you can hash if you want)
    if (password === adminPasswords[adminIndex]) {
      const user = {
        _id: "admin-fixed-id", // dummy id for admin
        name: "Admin User",
        email,
        role: "admin"
      };
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d"
      });
      return res.json({ user, token });
    } else {
      res.status(401);
      throw new Error("Invalid credentials");
    }
  }

  // Normal user login flow
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });

  res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token
  });
});

// GET /api/auth/me
export const getProfile = asyncHandler(async (req, res) => {
  // For admins logged in with env, just return dummy data
  if (req.user._id === "admin-fixed-id") {
    return res.json({
      _id: "admin-fixed-id",
      name: "Admin User",
      email: req.user.email,
      role: "admin"
    });
  }

  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
});


export const healthCheck = (req, res) => res.status(200).json({ status: 'ok' });
