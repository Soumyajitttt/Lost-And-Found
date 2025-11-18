import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import {
  createItem,
  getMyItems,
  getItemMatches,
  getAllItemsForAdmin,
  getLostItemsWithMatchesForAdmin,
  markMatchAsConfirmed,
  getAllItems,
  getAllItemsFilteredByType,
  updateItemStatus,
  deleteItem,
  getPendingItems,
  approveFoundItem
} from "../controllers/itemController.js";
import upload from "../utils/upload.js";

const router = express.Router();

// Correctly handle a single file upload named "image" to match the form
const imageUpload = upload.single("image");

// Admin routes
router.get("/admin/items", protect, adminOnly, getAllItemsForAdmin);
router.get("/admin/lost-matches", protect, adminOnly, getLostItemsWithMatchesForAdmin);
router.get("/admin/all", protect, adminOnly, getAllItems);
router.get("/admin/pending", protect, adminOnly, getPendingItems); // --- NEW
router.put("/admin/approve/:id", protect, adminOnly, approveFoundItem); // --- NEW

// User routes
router.post("/", protect, imageUpload, createItem);
router.get("/me", protect, getMyItems);
router.get("/:id/matches", protect, getItemMatches);
router.post("/:id/match/:matchId/confirm", protect, markMatchAsConfirmed);
router.put("/:id/status", protect, updateItemStatus);
router.delete("/:id", protect, deleteItem);

// Public route for browsing items
router.get("/", async (req, res) => {
  try {
    const { type, search, category } = req.query;
    let items;
    if (type) {
      items = await getAllItemsFilteredByType(type, search, category);
    } else {
      items = await getAllItems(); 
    }
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;