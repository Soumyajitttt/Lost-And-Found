import express from "express";
import { register, login, getProfile } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();


// Registration allowed only for students and teachers
router.post("/register", register);

// Login allowed for everyone (students, teachers, predefined admins)
router.post("/login", login);

// Get current profile
router.get("/me", protect, getProfile);

export default router;

