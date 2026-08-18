import { Check, Pencil, Plus, Target } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { BudgetProgress, PageHeading } from "../components/Ui";
import { Modal } from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { useFinance } from "../context/FinanceContext";
import { formatCurrency } from "../lib/format";
import type { Category } from "../types";

export function BudgetsPage() {
  const { user } = useAuth();
  const { categories, budgets, categoryReport, monthly, saveBudget } = useFinance();
  const [editing, setEditing] = useState<Category | "overall" | null>(null);
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const currency = user?.currency || "LKR";
  const expenseCategories = categories.filter((category) => category.type === "expense");
  const overall = budgets.find((budget) => !budget.categoryId);
  const totalAllocated = budgets.filter((budget) => budget.categoryId).reduce((sum, budget) => sum + budget.limitAmount, 0);
  const rows = useMemo(() => expenseCategories.map((category) => ({
    category,
    budget: budgets.find((budget) => budget.categoryId === category._id),
    spent: categoryReport.find((item) => item.categoryId === category._id)?.amount || 0,
  })), [expenseCategories, budgets, categoryReport]);

  function openEditor(target: Category | "overall") {
    setEditing(target);
    setAmount(String(target === "overall" ? overall?.limitAmount || "" : budgets.find((budget) => budget.categoryId === target._id)?.limitAmount || ""));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!editing || Number(amount) < 0) return;
    setSaving(true);
    try { await saveBudget(editing === "overall" ? null : editing._id, Number(amount)); setEditing(null); } finally { setSaving(false); }
  }

  return (
    <>
      <PageHeading eyebrow="Intentional spending" title="Monthly budgets" copy="Give every category a comfortable boundary. Finora will keep an eye on the pace." action={<button className="button primary" onClick={() => openEditor("overall")}><Target size={17} />Set overall plan</button>} />
      <section className="budget-overview card"><div className="budget-ring" style={{ "--progress": `${Math.min(((monthly?.expenses || 0) / (overall?.limitAmount || 1)) * 100, 100)}%` } as React.CSSProperties}><div><strong>{Math.round(((monthly?.expenses || 0) / (overall?.limitAmount || 1)) * 100)}%</strong><span>used</span></div></div><div className="budget-overview-copy"><span className="eyebrow">{new Date().toLocaleDateString("en-US", { month: "long" })} plan</span><h2>{formatCurrency(monthly?.expenses || 0, currency)} <small>spent of {formatCurrency(overall?.limitAmount || 0, currency)}</small></h2><p>{overall ? `${formatCurrency(Math.max(overall.limitAmount - (monthly?.expenses || 0), 0), currency)} is still unassigned to spending.` : "Add an overall ceiling to see your monthly runway."}</p><BudgetProgress value={monthly?.expenses || 0} limit={overall?.limitAmount || 0} /></div><div className="budget-stat"><span>Category limits</span><strong>{formatCurrency(totalAllocated, currency)}</strong><small>{rows.filter((row) => row.budget).length} active categories</small></div></section>
      <div className="section-title-row"><div><h2>Category limits</h2><p>Adjust limits as your priorities change.</p></div><button className="button secondary compact" onClick={() => openEditor(expenseCategories[0])}><Plus size={16} />Add limit</button></div>
      <section className="budget-grid">{rows.map(({ category, budget, spent }) => { const remaining = (budget?.limitAmount || 0) - spent; const percent = budget?.limitAmount ? Math.round((spent / budget.limitAmount) * 100) : 0; return <article className="card budget-card" key={category._id}><div className="budget-card-head"><span className="category-large-icon" style={{ background: `${category.color}18`, color: category.color }}><Target size={19} /></span><button className="icon-button" onClick={() => openEditor(category)} aria-label={`Edit ${category.name} budget`}><Pencil size={16} /></button></div><h3>{category.name}</h3>{budget ? <><strong>{formatCurrency(spent, currency)} <small>of {formatCurrency(budget.limitAmount, currency)}</small></strong><BudgetProgress value={spent} limit={budget.limitAmount} color={category.color} /><div className="budget-card-footer"><span className={remaining < 0 ? "over" : ""}>{remaining < 0 ? `${formatCurrency(Math.abs(remaining), currency)} over` : `${formatCurrency(remaining, currency)} left`}</span><em>{percent}%</em></div></> : <div className="no-budget"><p>No limit yet</p><button onClick={() => openEditor(category)}>Set a comfortable amount</button></div>}</article>; })}</section>
      <aside className="tip-banner"><span><Check size={18} /></span><div><strong>A good budget leaves breathing room.</strong><p>Finora recommends keeping category limits below 80% of expected income, leaving space for savings and surprises.</p></div></aside>
      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === "overall" ? "Set monthly plan" : `Set ${editing ? editing.name : "category"} limit`} description="You can adjust this at any point during the month."><form className="form-stack" onSubmit={submit}><div className="amount-field"><label htmlFor="budget-amount">Monthly limit</label><div><span>Rs.</span><input id="budget-amount" type="number" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" autoFocus /></div></div><div className="modal-actions"><button type="button" className="button secondary" onClick={() => setEditing(null)}>Cancel</button><button className="button primary" disabled={saving}>{saving ? "Saving…" : "Save budget"}</button></div></form></Modal>
    </>
  );
}
