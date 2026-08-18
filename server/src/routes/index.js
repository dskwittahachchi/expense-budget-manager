import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { login, me, register, updateProfile } from "../controllers/authController.js";
import { getBudgets, saveBudget } from "../controllers/budgetController.js";
import {
  createCategory,
  createTransaction,
  deleteCategory,
  deleteTransaction,
  exportTransactions,
  getCategories,
  getTransactions,
  updateTransaction,
} from "../controllers/financeController.js";
import { categoryReport, insights, monthlyReport } from "../controllers/reportController.js";
import { authMiddleware } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errors.js";
import { validateRequest } from "../middleware/validate.js";

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: "draft-7" });
const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  currency: z.enum(["LKR", "USD", "EUR", "GBP", "INR"]).optional(),
});
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const profileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  currency: z.enum(["LKR", "USD", "EUR", "GBP", "INR"]).optional(),
});
const categorySchema = z.object({
  name: z.string().trim().min(2).max(40),
  type: z.enum(["income", "expense"]),
  icon: z.string().max(40).default("circle"),
  color: z.string().regex(/^#[0-9a-f]{6}$/i).default("#5d8c82"),
});
const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive().max(1_000_000_000),
  categoryId: z.string().min(1),
  date: z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date."),
  description: z.string().trim().min(2).max(160),
  paymentMethod: z.enum(["card", "cash", "bank", "wallet"]).default("card"),
  recurring: z.boolean().default(false),
});
const budgetSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2200),
  categoryId: z.string().nullable().optional(),
  limitAmount: z.coerce.number().nonnegative().max(1_000_000_000),
});

router.get("/health", (_req, res) => res.json({ success: true, message: "Finora API is healthy.", data: { status: "ok" } }));
router.post("/auth/register", authLimiter, validateRequest(registerSchema), asyncHandler(register));
router.post("/auth/login", authLimiter, validateRequest(loginSchema), asyncHandler(login));
router.get("/auth/me", authMiddleware, asyncHandler(me));
router.put("/auth/me", authMiddleware, validateRequest(profileSchema), asyncHandler(updateProfile));

router.use(authMiddleware);
router.get("/categories", asyncHandler(getCategories));
router.post("/categories", validateRequest(categorySchema), asyncHandler(createCategory));
router.delete("/categories/:id", asyncHandler(deleteCategory));
router.get("/transactions/export", asyncHandler(exportTransactions));
router.get("/transactions", asyncHandler(getTransactions));
router.post("/transactions", validateRequest(transactionSchema), asyncHandler(createTransaction));
router.put("/transactions/:id", validateRequest(transactionSchema), asyncHandler(updateTransaction));
router.delete("/transactions/:id", asyncHandler(deleteTransaction));
router.get("/budgets", asyncHandler(getBudgets));
router.post("/budgets", validateRequest(budgetSchema), asyncHandler(saveBudget));
router.get("/reports/monthly", asyncHandler(monthlyReport));
router.get("/reports/categories", asyncHandler(categoryReport));
router.get("/insights", asyncHandler(insights));

export default router;

