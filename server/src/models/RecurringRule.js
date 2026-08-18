import mongoose from "mongoose";

const recurringRuleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    frequency: { type: String, enum: ["weekly", "monthly", "yearly"], required: true },
    nextDate: { type: Date, required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    description: { type: String, required: true, trim: true, maxlength: 160 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const RecurringRule =
  mongoose.models.RecurringRule || mongoose.model("RecurringRule", recurringRuleSchema);

