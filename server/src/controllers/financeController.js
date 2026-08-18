import {
  createCategory as createCategoryRecord,
  createTransaction as createTransactionRecord,
  deleteCategory as deleteCategoryRecord,
  deleteTransaction as deleteTransactionRecord,
  listCategories,
  listTransactions,
  updateTransaction as updateTransactionRecord,
} from "../services/repository.js";

async function assertOwnedCategory(userId, categoryId, type) {
  const categories = await listCategories(userId);
  const category = categories.find((item) => String(item._id) === String(categoryId));
  if (!category || (type && category.type !== type)) {
    const error = new Error("Select a valid category for this transaction type.");
    error.statusCode = 400;
    throw error;
  }
  return category;
}

export async function getCategories(req, res) {
  res.json({ success: true, message: "Categories loaded.", data: await listCategories(req.user._id) });
}

export async function createCategory(req, res) {
  const category = await createCategoryRecord(req.user._id, req.body);
  res.status(201).json({ success: true, message: "Category created.", data: category });
}

export async function deleteCategory(req, res) {
  const category = await deleteCategoryRecord(req.user._id, req.params.id);
  if (!category) {
    const error = new Error("Default categories cannot be deleted, or this category was not found.");
    error.statusCode = 404;
    throw error;
  }
  res.json({ success: true, message: "Category deleted.", data: category });
}

export async function getTransactions(req, res) {
  const result = await listTransactions(req.user._id, req.query);
  res.json({ success: true, message: "Transactions loaded.", data: result });
}

export async function createTransaction(req, res) {
  await assertOwnedCategory(req.user._id, req.body.categoryId, req.body.type);
  const transaction = await createTransactionRecord(req.user._id, req.body);
  res.status(201).json({ success: true, message: "Transaction added.", data: transaction });
}

export async function updateTransaction(req, res) {
  await assertOwnedCategory(req.user._id, req.body.categoryId, req.body.type);
  const transaction = await updateTransactionRecord(req.user._id, req.params.id, req.body);
  if (!transaction) {
    const error = new Error("Transaction not found.");
    error.statusCode = 404;
    throw error;
  }
  res.json({ success: true, message: "Transaction updated.", data: transaction });
}

export async function deleteTransaction(req, res) {
  const transaction = await deleteTransactionRecord(req.user._id, req.params.id);
  if (!transaction) {
    const error = new Error("Transaction not found.");
    error.statusCode = 404;
    throw error;
  }
  res.json({ success: true, message: "Transaction deleted.", data: transaction });
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function exportTransactions(req, res) {
  const { items } = await listTransactions(req.user._id, { ...req.query, limit: 500 });
  const categories = await listCategories(req.user._id);
  const categoryNames = Object.fromEntries(categories.map((item) => [String(item._id), item.name]));
  const rows = [
    ["Date", "Description", "Type", "Category", "Payment method", "Recurring", "Amount"],
    ...items.map((item) => [
      new Date(item.date).toISOString().slice(0, 10),
      item.description,
      item.type,
      categoryNames[String(item.categoryId)] || "Uncategorized",
      item.paymentMethod,
      item.recurring ? "Yes" : "No",
      item.amount,
    ]),
  ];
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="finora-transactions.csv"');
  res.send(rows.map((row) => row.map(csvCell).join(",")).join("\n"));
}

