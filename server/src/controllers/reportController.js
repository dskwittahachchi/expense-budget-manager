import { listBudgets, listCategories, listTransactions } from "../services/repository.js";

function periodKey(date) {
  const value = new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

async function reportSource(userId) {
  const [{ items }, categories] = await Promise.all([
    listTransactions(userId, { limit: 500 }),
    listCategories(userId),
  ]);
  return { transactions: items, categories };
}

export async function monthlyReport(req, res) {
  const { transactions } = await reportSource(req.user._id);
  const now = new Date();
  const selectedMonth = Number(req.query.month) || now.getMonth() + 1;
  const selectedYear = Number(req.query.year) || now.getFullYear();
  const key = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
  const selected = transactions.filter((item) => periodKey(item.date) === key);
  const income = selected.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenses = selected.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);

  const trend = [];
  for (let offset = -5; offset <= 0; offset += 1) {
    const date = new Date(selectedYear, selectedMonth - 1 + offset, 1);
    const monthKey = periodKey(date);
    const group = transactions.filter((item) => periodKey(item.date) === monthKey);
    trend.push({
      key: monthKey,
      month: date.toLocaleDateString("en-US", { month: "short" }),
      income: group.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0),
      expenses: group.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0),
    });
  }
  res.json({
    success: true,
    message: "Monthly report generated.",
    data: { month: selectedMonth, year: selectedYear, income, expenses, balance: income - expenses, savingsRate: income ? ((income - expenses) / income) * 100 : 0, trend },
  });
}

export async function categoryReport(req, res) {
  const { transactions, categories } = await reportSource(req.user._id);
  const now = new Date();
  const key = `${Number(req.query.year) || now.getFullYear()}-${String(Number(req.query.month) || now.getMonth() + 1).padStart(2, "0")}`;
  const expenses = transactions.filter((item) => item.type === "expense" && periodKey(item.date) === key);
  const breakdown = categories
    .filter((category) => category.type === "expense")
    .map((category) => ({
      categoryId: category._id,
      name: category.name,
      color: category.color,
      amount: expenses.filter((item) => String(item.categoryId) === String(category._id)).reduce((sum, item) => sum + item.amount, 0),
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  res.json({ success: true, message: "Category report generated.", data: breakdown });
}

export async function insights(req, res) {
  const now = new Date();
  const month = Number(req.query.month) || now.getMonth() + 1;
  const year = Number(req.query.year) || now.getFullYear();
  const [{ transactions, categories }, budgets] = await Promise.all([
    reportSource(req.user._id),
    listBudgets(req.user._id, month, year),
  ]);
  const key = `${year}-${String(month).padStart(2, "0")}`;
  const currentExpenses = transactions.filter((item) => item.type === "expense" && periodKey(item.date) === key);
  const total = currentExpenses.reduce((sum, item) => sum + item.amount, 0);
  const income = transactions.filter((item) => item.type === "income" && periodKey(item.date) === key).reduce((sum, item) => sum + item.amount, 0);
  const overall = budgets.find((item) => !item.categoryId);
  const categoryTotals = categories.map((category) => ({
    name: category.name,
    amount: currentExpenses.filter((item) => String(item.categoryId) === String(category._id)).reduce((sum, item) => sum + item.amount, 0),
  })).sort((a, b) => b.amount - a.amount);
  const top = categoryTotals[0] || { name: "Spending", amount: 0 };
  const recurring = currentExpenses.filter((item) => item.recurring).reduce((sum, item) => sum + item.amount, 0);
  const projected = Math.round((total / Math.max(now.getDate(), 1)) * new Date(year, month, 0).getDate());
  const budgetHealth = overall ? Math.round((total / overall.limitAmount) * 100) : null;
  const insightItems = [
    {
      tone: budgetHealth !== null && budgetHealth > 80 ? "warning" : "positive",
      title: budgetHealth !== null ? `${budgetHealth}% of monthly budget used` : "Set an overall monthly budget",
      detail: overall
        ? `At this pace, projected spending is ${Math.round(projected).toLocaleString("en-US")} ${req.user.currency}.`
        : "A monthly ceiling lets Finora flag drift before it becomes a surprise.",
    },
    {
      tone: "neutral",
      title: `${top.name} is your largest spend area`,
      detail: total ? `${Math.round((top.amount / total) * 100)}% of this month's expenses are in this category.` : "Add expenses to unlock a category pattern.",
    },
    {
      tone: income - total >= income * 0.2 ? "positive" : "warning",
      title: income ? `${Math.round(((income - total) / income) * 100)}% estimated savings rate` : "Income needed for savings guidance",
      detail: `Recurring commitments account for ${total ? Math.round((recurring / total) * 100) : 0}% of spending this month.`,
    },
  ];
  res.json({
    success: true,
    message: "Insights generated.",
    data: { projectedSpend: projected, budgetHealth, items: insightItems, generatedAt: new Date().toISOString() },
  });
}

