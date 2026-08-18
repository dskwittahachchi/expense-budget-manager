import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiRequest, downloadCsv } from "../lib/api";
import type {
  Budget,
  Category,
  CategoryReport,
  InsightReport,
  MonthlyReport,
  Transaction,
  TransactionInput,
} from "../types";
import { useAuth } from "./AuthContext";

interface FinanceValue {
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  monthly: MonthlyReport | null;
  categoryReport: CategoryReport[];
  insights: InsightReport | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  saveTransaction: (values: TransactionInput, id?: string) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  saveBudget: (categoryId: string | null, limitAmount: number) => Promise<void>;
  addCategory: (values: Pick<Category, "name" | "type" | "color" | "icon">) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  exportCsv: () => Promise<void>;
}

const FinanceContext = createContext<FinanceValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [monthly, setMonthly] = useState<MonthlyReport | null>(null);
  const [categoryReport, setCategoryReport] = useState<CategoryReport[]>([]);
  const [insights, setInsights] = useState<InsightReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [categoryData, transactionData, budgetData, monthlyData, reportData, insightData] = await Promise.all([
        apiRequest<Category[]>("/categories", {}, token),
        apiRequest<{ items: Transaction[] }>("/transactions?limit=500", {}, token),
        apiRequest<Budget[]>("/budgets", {}, token),
        apiRequest<MonthlyReport>("/reports/monthly", {}, token),
        apiRequest<CategoryReport[]>("/reports/categories", {}, token),
        apiRequest<InsightReport>("/insights", {}, token),
      ]);
      setCategories(categoryData);
      setTransactions(transactionData.items);
      setBudgets(budgetData);
      setMonthly(monthlyData);
      setCategoryReport(reportData);
      setInsights(insightData);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load your finances.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function saveTransaction(values: TransactionInput, id?: string) {
    await apiRequest(`/transactions${id ? `/${id}` : ""}`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(values),
    }, token);
    await refresh();
  }

  async function removeTransaction(id: string) {
    await apiRequest(`/transactions/${id}`, { method: "DELETE" }, token);
    await refresh();
  }

  async function saveBudget(categoryId: string | null, limitAmount: number) {
    const now = new Date();
    await apiRequest("/budgets", {
      method: "POST",
      body: JSON.stringify({ categoryId, limitAmount, month: now.getMonth() + 1, year: now.getFullYear() }),
    }, token);
    await refresh();
  }

  async function addCategory(values: Pick<Category, "name" | "type" | "color" | "icon">) {
    await apiRequest("/categories", { method: "POST", body: JSON.stringify(values) }, token);
    await refresh();
  }

  async function removeCategory(id: string) {
    await apiRequest(`/categories/${id}`, { method: "DELETE" }, token);
    await refresh();
  }

  const value = useMemo<FinanceValue>(() => ({
    categories,
    transactions,
    budgets,
    monthly,
    categoryReport,
    insights,
    loading,
    error,
    refresh,
    saveTransaction,
    removeTransaction,
    saveBudget,
    addCategory,
    removeCategory,
    exportCsv: async () => { if (token) await downloadCsv(token); },
  }), [categories, transactions, budgets, monthly, categoryReport, insights, loading, error, refresh, token]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const value = useContext(FinanceContext);
  if (!value) throw new Error("useFinance must be used within FinanceProvider");
  return value;
}

