import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["lost", "found"], required: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    photos: [{ type: String }],
    contact: { type: String },
    matchedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
    status: { type: String, enum: ["active", "resolved"], default: "active" },
    verificationStatus: {type: String, enum: ["pending", "verified", "rejected"], default: "pending",},   
  },
  { timestamps: true }
);

export default mongoose.model("Item", itemSchema);