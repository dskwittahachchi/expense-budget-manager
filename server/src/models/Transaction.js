import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true, enum: ["income", "expense"], index: true },
    amount: { type: Number, required: true, min: 0.01 },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    date: { type: Date, required: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 160 },
    paymentMethod: {
      type: String,
      enum: ["card", "cash", "bank", "wallet"],
      default: "card",
    },
    recurring: { type: Boolean, default: false },
  },
  { timestamps: true },
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, description: "text" });

export const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);

