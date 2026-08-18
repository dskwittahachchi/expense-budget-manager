import {
  ArrowDownLeft,
  ArrowUpRight,
  BrainCircuit,
  CircleDollarSign,
  Inbox,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { Category, InsightReport, Transaction } from "../types";
import { formatCurrency, formatDate } from "../lib/format";

export function PageHeading({ eyebrow, title, copy, action }: { eyebrow?: string; title: string; copy: string; action?: React.ReactNode }) {
  return <header className="page-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1><p>{copy}</p></div>{action}</header>;
}

export function MetricCard({ label, value, note, tone = "ink", icon: Icon = CircleDollarSign }: { label: string; value: string; note: string; tone?: "ink" | "mint" | "coral" | "lilac"; icon?: LucideIcon }) {
  return <article className={`metric-card tone-${tone}`}><div className="metric-icon"><Icon size={20} /></div><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></article>;
}

export function LoadingState() {
  return <div className="loading-state"><span className="loader-mark"><Sparkles /></span><strong>Bringing your money into focus</strong><p>Finora is preparing your dashboard.</p></div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="empty-state error-state"><span><RefreshCw /></span><h3>We hit a snag</h3><p>{message}</p><button className="button secondary" onClick={onRetry}>Try again</button></div>;
}

export function EmptyState({ title, copy, action }: { title: string; copy: string; action?: React.ReactNode }) {
  return <div className="empty-state"><span><Inbox /></span><h3>{title}</h3><p>{copy}</p>{action}</div>;
}

export function CategoryDot({ category }: { category?: Category }) {
  return <span className="category-dot" style={{ background: category?.color || "#98a8a4" }} />;
}

export function TransactionRow({ transaction, category, currency, onEdit, onDelete }: { transaction: Transaction; category?: Category; currency: string; onEdit?: () => void; onDelete?: () => void }) {
  const income = transaction.type === "income";
  return <div className="transaction-row"><div className={`transaction-icon ${income ? "income" : "expense"}`}>{income ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}</div><div className="transaction-main"><strong>{transaction.description}</strong><span><CategoryDot category={category} />{category?.name || "Uncategorized"}{transaction.recurring && <em>Recurring</em>}</span></div><time>{formatDate(transaction.date)}</time><span className={`transaction-amount ${income ? "income" : "expense"}`}>{income ? "+" : "−"}{formatCurrency(transaction.amount, currency)}</span>{(onEdit || onDelete) && <div className="row-actions">{onEdit && <button onClick={onEdit}>Edit</button>}{onDelete && <button className="danger-link" onClick={onDelete}>Delete</button>}</div>}</div>;
}

export function BudgetProgress({ value, limit, color = "#4fb99f" }: { value: number; limit: number; color?: string }) {
  const percent = limit ? Math.min((value / limit) * 100, 100) : 0;
  return <div className="progress-track" aria-label={`${Math.round(percent)} percent used`}><span style={{ width: `${percent}%`, background: value > limit ? "#df725f" : color }} /></div>;
}

export function AiPanel({ report, currency }: { report: InsightReport | null; currency: string }) {
  return <section className="ai-panel"><div className="ai-panel-top"><span className="ai-orb"><BrainCircuit size={22} /></span><div><span className="eyebrow light">Finora intelligence</span><h2>Your money, translated</h2></div><span className="live-pill"><i />Live analysis</span></div><div className="insight-list">{report?.items.map((item, index) => <article key={item.title}><span className={`insight-number ${item.tone}`}>0{index + 1}</span><div><strong>{item.title}</strong><p>{item.detail}</p></div></article>)}</div><div className="ai-footer"><TrendingUp size={17} /><span>Projected month-end spend</span><strong>{formatCurrency(report?.projectedSpend || 0, currency)}</strong></div></section>;
}

export const metricIcons = { balance: CircleDollarSign, income: ArrowDownLeft, expense: ArrowUpRight, saving: Target };

