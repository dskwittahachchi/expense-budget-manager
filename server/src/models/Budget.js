import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2000, max: 2200 },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    limitAmount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

budgetSchema.index({ userId: 1, month: 1, year: 1, categoryId: 1 }, { unique: true });

export const Budget = mongoose.models.Budget || mongoose.model("Budget", budgetSchema);

