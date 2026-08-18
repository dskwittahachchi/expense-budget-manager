import { ArrowRight, CalendarDays, Plus } from "lucide-react";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AiPanel, BudgetProgress, ErrorState, LoadingState, MetricCard, PageHeading, TransactionRow, metricIcons } from "../components/Ui";
import { TransactionModal } from "../components/TransactionModal";
import { useAuth } from "../context/AuthContext";
import { useFinance } from "../context/FinanceContext";
import { formatCurrency } from "../lib/format";

export function DashboardPage() {
  const { user } = useAuth();
  const { categories, transactions, budgets, monthly, categoryReport, insights, loading, error, refresh, saveTransaction } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  const currency = user?.currency || "LKR";
  const recent = transactions.slice(0, 5);
  const overall = budgets.find((budget) => !budget.categoryId);
  const monthlyBudget = overall?.limitAmount || 0;
  const spent = monthly?.expenses || 0;
  const remaining = Math.max(monthlyBudget - spent, 0);
  const firstName = user?.name.split(" ")[0] || "there";

  return (
    <>
      <PageHeading
        eyebrow="Financial overview"
        title={`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, ${firstName}.`}
        copy="Here’s the shape of your money this month—and what deserves your attention."
        action={<button className="month-selector"><CalendarDays size={17} />{new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</button>}
      />
      <section className="metrics-grid">
        <MetricCard label="Net balance" value={formatCurrency(monthly?.balance || 0, currency)} note={`${monthly?.savingsRate.toFixed(0) || 0}% savings rate`} tone="ink" icon={metricIcons.balance} />
        <MetricCard label="Income" value={formatCurrency(monthly?.income || 0, currency)} note="On schedule this month" tone="mint" icon={metricIcons.income} />
        <MetricCard label="Spent" value={formatCurrency(spent, currency)} note={monthlyBudget ? `${Math.round((spent / monthlyBudget) * 100)}% of your plan` : "Set a budget to compare"} tone="coral" icon={metricIcons.expense} />
        <MetricCard label="Budget left" value={formatCurrency(remaining, currency)} note={monthlyBudget ? `${Math.max(100 - Math.round((spent / monthlyBudget) * 100), 0)}% still available` : "No limit set yet"} tone="lilac" icon={metricIcons.saving} />
      </section>
      <div className="dashboard-grid">
        <section className="card chart-card span-two"><div className="card-heading"><div><span className="eyebrow">Cash flow</span><h2>Six-month rhythm</h2></div><div className="chart-legend"><span className="income"><i />Income</span><span className="expense"><i />Expenses</span></div></div><div className="large-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={monthly?.trend || []} margin={{ left: -20, right: 8, top: 18 }}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4bb59d" stopOpacity={0.34} /><stop offset="100%" stopColor="#4bb59d" stopOpacity={0} /></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#de806d" stopOpacity={0.25} /><stop offset="100%" stopColor="#de806d" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#e9eeeb" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#71807a", fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${Math.round(value / 1000)}k`} tick={{ fill: "#71807a", fontSize: 12 }} /><Tooltip formatter={(value) => formatCurrency(Number(value), currency)} contentStyle={{ border: 0, borderRadius: 14, boxShadow: "0 12px 30px rgba(19,45,42,.12)" }} /><Area type="monotone" dataKey="income" stroke="#3a9d87" strokeWidth={2.5} fill="url(#incomeFill)" /><Area type="monotone" dataKey="expenses" stroke="#d56f5c" strokeWidth={2.5} fill="url(#expenseFill)" /></AreaChart></ResponsiveContainer></div></section>
        <section className="card budget-snapshot"><div className="card-heading"><div><span className="eyebrow">Monthly plan</span><h2>Budget pulse</h2></div><a href="/budgets">View all <ArrowRight size={15} /></a></div><div className="budget-hero"><span>Available to spend</span><strong>{formatCurrency(remaining, currency)}</strong><small>of {formatCurrency(monthlyBudget, currency)}</small><BudgetProgress value={spent} limit={monthlyBudget} /></div><div className="budget-mini-list">{categoryReport.slice(0, 3).map((item) => { const budget = budgets.find((value) => value.categoryId === item.categoryId); return <div key={item.categoryId}><div><span><i style={{ background: item.color }} />{item.name}</span><strong>{formatCurrency(item.amount, currency, true)} <small>/ {formatCurrency(budget?.limitAmount || 0, currency, true)}</small></strong></div><BudgetProgress value={item.amount} limit={budget?.limitAmount || 0} color={item.color} /></div>; })}</div></section>
        <AiPanel report={insights} currency={currency} />
        <section className="card recent-card span-two"><div className="card-heading"><div><span className="eyebrow">Latest activity</span><h2>Recent transactions</h2></div><button className="button secondary compact" onClick={() => setModalOpen(true)}><Plus size={16} />New</button></div><div className="transaction-list">{recent.map((transaction) => <TransactionRow key={transaction._id} transaction={transaction} category={categories.find((category) => category._id === transaction.categoryId)} currency={currency} />)}</div><a className="card-footer-link" href="/transactions">See every transaction <ArrowRight size={15} /></a></section>
      </div>
      <TransactionModal open={modalOpen} categories={categories} onClose={() => setModalOpen(false)} onSave={saveTransaction} />
    </>
  );
}

