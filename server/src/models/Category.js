import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    type: { type: String, required: true, enum: ["income", "expense"], index: true },
    icon: { type: String, default: "circle" },
    color: { type: String, default: "#5d8c82" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

categorySchema.index({ userId: 1, name: 1, type: 1 }, { unique: true });

export const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

