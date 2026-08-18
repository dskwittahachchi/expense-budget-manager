import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";

export const memory = {
  users: [],
  categories: [],
  transactions: [],
  budgets: [],
};

export const categoryTemplates = [
  ["Salary", "income", "briefcase", "#256c5b"],
  ["Freelance", "income", "sparkles", "#5d7cf5"],
  ["Housing", "expense", "house", "#8f6ad8"],
  ["Food & dining", "expense", "utensils", "#ed8e5b"],
  ["Transport", "expense", "car", "#e0b049"],
  ["Utilities", "expense", "zap", "#5b8def"],
  ["Shopping", "expense", "shopping-bag", "#d96c8b"],
  ["Health", "expense", "heart-pulse", "#48a7a0"],
  ["Education", "expense", "graduation-cap", "#7181c7"],
  ["Entertainment", "expense", "popcorn", "#a66b91"],
];

function monthDate(offset, day) {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + offset, day, 12).toISOString();
}

function withTimestamps(record) {
  const now = new Date().toISOString();
  return { ...record, createdAt: now, updatedAt: now };
}

export async function seedDemoStore(force = false) {
  if (memory.users.length && !force) return;
  memory.users.length = 0;
  memory.categories.length = 0;
  memory.transactions.length = 0;
  memory.budgets.length = 0;

  const user = withTimestamps({
    _id: randomUUID(),
    name: "Nimali Perera",
    email: "demo@finora.app",
    passwordHash: await bcrypt.hash("demo1234", 10),
    currency: "LKR",
  });
  memory.users.push(user);

  const categories = categoryTemplates.map(([name, type, icon, color]) =>
    withTimestamps({
      _id: randomUUID(),
      userId: user._id,
      name,
      type,
      icon,
      color,
      isDefault: true,
    }),
  );
  memory.categories.push(...categories);
  const byName = Object.fromEntries(categories.map((category) => [category.name, category]));

  const recurringMonthly = [
    ["Monthly salary", "income", 485000, "Salary", 1, "bank", true],
    ["Apartment rent", "expense", 95000, "Housing", 3, "bank", true],
    ["Electricity & water", "expense", 14500, "Utilities", 8, "card", true],
    ["Home internet", "expense", 7900, "Utilities", 12, "card", true],
    ["Supermarket run", "expense", 28600, "Food & dining", 6, "card", false],
    ["Fuel & rides", "expense", 18400, "Transport", 10, "card", false],
    ["Weekend dinner", "expense", 12800, "Food & dining", 15, "card", false],
    ["Pharmacy", "expense", 7600, "Health", 18, "cash", false],
    ["Online course", "expense", 16500, "Education", 20, "card", false],
    ["Home essentials", "expense", 14200, "Shopping", 23, "wallet", false],
    ["Cinema & coffee", "expense", 8400, "Entertainment", 25, "card", false],
  ];

  for (let offset = -5; offset <= 0; offset += 1) {
    recurringMonthly.forEach(([description, type, base, category, day, paymentMethod, recurring], index) => {
      const variation = type === "expense" ? 1 + (((offset + 5) * 7 + index * 3) % 11 - 5) / 100 : 1;
      memory.transactions.push(
        withTimestamps({
          _id: randomUUID(),
          userId: user._id,
          description,
          type,
          amount: Math.round(Number(base) * variation / 100) * 100,
          categoryId: byName[category]._id,
          date: monthDate(offset, Number(day)),
          paymentMethod,
          recurring,
        }),
      );
    });
  }

  const today = new Date();
  const limits = {
    Housing: 100000,
    "Food & dining": 60000,
    Transport: 30000,
    Utilities: 30000,
    Shopping: 25000,
    Health: 20000,
    Education: 25000,
    Entertainment: 20000,
  };
  memory.budgets.push(
    withTimestamps({
      _id: randomUUID(),
      userId: user._id,
      month: today.getMonth() + 1,
      year: today.getFullYear(),
      categoryId: null,
      limitAmount: 290000,
    }),
  );
  Object.entries(limits).forEach(([name, limitAmount]) => {
    memory.budgets.push(
      withTimestamps({
        _id: randomUUID(),
        userId: user._id,
        month: today.getMonth() + 1,
        year: today.getFullYear(),
        categoryId: byName[name]._id,
        limitAmount,
      }),
    );
  });
}

export function createDefaultCategories(userId) {
  return categoryTemplates.map(([name, type, icon, color]) =>
    withTimestamps({
      _id: randomUUID(),
      userId,
      name,
      type,
      icon,
      color,
      isDefault: true,
    }),
  );
}

export function makeMemoryRecord(values) {
  return withTimestamps({ _id: randomUUID(), ...values });
}
