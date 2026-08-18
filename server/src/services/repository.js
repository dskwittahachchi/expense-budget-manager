import { randomUUID } from "node:crypto";
import { isMongoReady } from "../config/database.js";
import { memory, makeMemoryRecord } from "../data/memory.js";
import { Budget } from "../models/Budget.js";
import { Category } from "../models/Category.js";
import { Transaction } from "../models/Transaction.js";
import { User } from "../models/User.js";

const now = () => new Date().toISOString();

export async function findUserByEmail(email) {
  if (isMongoReady()) return User.findOne({ email: email.toLowerCase() }).select("+passwordHash").lean();
  return memory.users.find((user) => user.email === email.toLowerCase()) || null;
}

export async function findUserById(id) {
  if (isMongoReady()) return User.findById(id).lean();
  return memory.users.find((user) => user._id === id) || null;
}

export async function createUser(values) {
  if (isMongoReady()) return (await User.create(values)).toObject();
  const user = makeMemoryRecord({ ...values, _id: randomUUID() });
  memory.users.push(user);
  return user;
}

export async function updateUser(id, values) {
  if (isMongoReady()) {
    return User.findOneAndUpdate({ _id: id }, values, { new: true, runValidators: true }).lean();
  }
  const index = memory.users.findIndex((item) => item._id === id);
  if (index < 0) return null;
  memory.users[index] = { ...memory.users[index], ...values, updatedAt: now() };
  return memory.users[index];
}

export async function createCategories(values) {
  if (isMongoReady()) return Category.insertMany(values);
  const records = values.map((value) => makeMemoryRecord(value));
  memory.categories.push(...records);
  return records;
}

export async function listCategories(userId) {
  if (isMongoReady()) return Category.find({ userId }).sort({ type: -1, name: 1 }).lean();
  return memory.categories
    .filter((item) => item.userId === userId)
    .sort((a, b) => `${b.type}${a.name}`.localeCompare(`${a.type}${b.name}`));
}

export async function createCategory(userId, values) {
  if (isMongoReady()) return (await Category.create({ ...values, userId })).toObject();
  const duplicate = memory.categories.some(
    (item) => item.userId === userId && item.type === values.type && item.name.toLowerCase() === values.name.toLowerCase(),
  );
  if (duplicate) {
    const error = new Error("A category with that name already exists.");
    error.statusCode = 409;
    throw error;
  }
  const record = makeMemoryRecord({ ...values, userId, isDefault: false });
  memory.categories.push(record);
  return record;
}

export async function deleteCategory(userId, id) {
  if (isMongoReady()) return Category.findOneAndDelete({ _id: id, userId, isDefault: false }).lean();
  const index = memory.categories.findIndex(
    (item) => item._id === id && item.userId === userId && !item.isDefault,
  );
  if (index < 0) return null;
  return memory.categories.splice(index, 1)[0];
}

function filterMemoryTransactions(userId, filters) {
  const search = filters.search?.toLowerCase();
  return memory.transactions
    .filter((item) => item.userId === userId)
    .filter((item) => !filters.type || filters.type === "all" || item.type === filters.type)
    .filter((item) => !filters.categoryId || item.categoryId === filters.categoryId)
    .filter((item) => !search || item.description.toLowerCase().includes(search))
    .filter((item) => !filters.startDate || new Date(item.date) >= new Date(filters.startDate))
    .filter((item) => !filters.endDate || new Date(item.date) <= new Date(`${filters.endDate}T23:59:59`))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function listTransactions(userId, filters = {}) {
  const page = Math.max(Number(filters.page) || 1, 1);
  const limit = Math.min(Math.max(Number(filters.limit) || 100, 1), 500);

  if (isMongoReady()) {
    const query = { userId };
    if (filters.type && filters.type !== "all") query.type = filters.type;
    if (filters.categoryId) query.categoryId = filters.categoryId;
    if (filters.search) query.$text = { $search: filters.search };
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = new Date(filters.startDate);
      if (filters.endDate) query.date.$lte = new Date(`${filters.endDate}T23:59:59`);
    }
    const [items, total] = await Promise.all([
      Transaction.find(query).sort({ date: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Transaction.countDocuments(query),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) || 1 };
  }

  const filtered = filterMemoryTransactions(userId, filters);
  return {
    items: filtered.slice((page - 1) * limit, page * limit),
    total: filtered.length,
    page,
    pages: Math.ceil(filtered.length / limit) || 1,
  };
}

export async function createTransaction(userId, values) {
  if (isMongoReady()) return (await Transaction.create({ ...values, userId })).toObject();
  const record = makeMemoryRecord({ ...values, userId });
  memory.transactions.push(record);
  return record;
}

export async function updateTransaction(userId, id, values) {
  if (isMongoReady()) {
    return Transaction.findOneAndUpdate({ _id: id, userId }, values, { new: true, runValidators: true }).lean();
  }
  const index = memory.transactions.findIndex((item) => item._id === id && item.userId === userId);
  if (index < 0) return null;
  memory.transactions[index] = { ...memory.transactions[index], ...values, updatedAt: now() };
  return memory.transactions[index];
}

export async function deleteTransaction(userId, id) {
  if (isMongoReady()) return Transaction.findOneAndDelete({ _id: id, userId }).lean();
  const index = memory.transactions.findIndex((item) => item._id === id && item.userId === userId);
  if (index < 0) return null;
  return memory.transactions.splice(index, 1)[0];
}

export async function listBudgets(userId, month, year) {
  if (isMongoReady()) return Budget.find({ userId, month, year }).sort({ categoryId: 1 }).lean();
  return memory.budgets.filter(
    (item) => item.userId === userId && item.month === Number(month) && item.year === Number(year),
  );
}

export async function upsertBudget(userId, values) {
  const key = { userId, month: values.month, year: values.year, categoryId: values.categoryId || null };
  if (isMongoReady()) {
    return Budget.findOneAndUpdate(key, { ...values, categoryId: values.categoryId || null }, {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }).lean();
  }
  const index = memory.budgets.findIndex(
    (item) =>
      item.userId === userId &&
      item.month === values.month &&
      item.year === values.year &&
      (item.categoryId || null) === (values.categoryId || null),
  );
  if (index >= 0) {
    memory.budgets[index] = { ...memory.budgets[index], ...values, categoryId: values.categoryId || null, updatedAt: now() };
    return memory.budgets[index];
  }
  const record = makeMemoryRecord({ ...values, userId, categoryId: values.categoryId || null });
  memory.budgets.push(record);
  return record;
}

