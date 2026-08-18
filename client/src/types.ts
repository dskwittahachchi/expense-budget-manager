export type TransactionType = "income" | "expense";

export interface User {
  _id: string;
  name: string;
  email: string;
  currency: "LKR" | "USD" | "EUR" | "GBP" | "INR";
}

export interface Category {
  _id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface Transaction {
  _id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: string;
  description: string;
  paymentMethod: "card" | "cash" | "bank" | "wallet";
  recurring: boolean;
  createdAt: string;
}

export interface Budget {
  _id: string;
  month: number;
  year: number;
  categoryId: string | null;
  limitAmount: number;
}

export interface MonthlyReport {
  month: number;
  year: number;
  income: number;
  expenses: number;
  balance: number;
  savingsRate: number;
  trend: Array<{ key: string; month: string; income: number; expenses: number }>;
}

export interface CategoryReport {
  categoryId: string;
  name: string;
  color: string;
  amount: number;
}

export interface Insight {
  tone: "positive" | "warning" | "neutral";
  title: string;
  detail: string;
}

export interface InsightReport {
  projectedSpend: number;
  budgetHealth: number | null;
  items: Insight[];
  generatedAt: string;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: string;
  description: string;
  paymentMethod: Transaction["paymentMethod"];
  recurring: boolean;
}

