import { listBudgets, listCategories, upsertBudget } from "../services/repository.js";

export async function getBudgets(req, res) {
  const date = new Date();
  const month = Number(req.query.month) || date.getMonth() + 1;
  const year = Number(req.query.year) || date.getFullYear();
  res.json({
    success: true,
    message: "Budgets loaded.",
    data: await listBudgets(req.user._id, month, year),
  });
}

export async function saveBudget(req, res) {
  if (req.body.categoryId) {
    const categories = await listCategories(req.user._id);
    const category = categories.find((item) => String(item._id) === String(req.body.categoryId));
    if (!category || category.type !== "expense") {
      const error = new Error("Select a valid expense category.");
      error.statusCode = 400;
      throw error;
    }
  }
  const budget = await upsertBudget(req.user._id, req.body);
  res.status(201).json({ success: true, message: "Budget saved.", data: budget });
}

