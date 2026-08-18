import { Download, Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Modal } from "../components/Modal";
import { TransactionModal } from "../components/TransactionModal";
import { EmptyState, PageHeading, TransactionRow } from "../components/Ui";
import { useAuth } from "../context/AuthContext";
import { useFinance } from "../context/FinanceContext";
import type { Transaction } from "../types";

export function TransactionsPage() {
  const { user } = useAuth();
  const { transactions, categories, saveTransaction, removeTransaction, exportCsv } = useFinance();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => transactions.filter((transaction) => {
    const matchesQuery = transaction.description.toLowerCase().includes(query.toLowerCase());
    const matchesType = type === "all" || transaction.type === type;
    const matchesCategory = categoryId === "all" || transaction.categoryId === categoryId;
    return matchesQuery && matchesType && matchesCategory;
  }), [transactions, query, type, categoryId]);

  function openNew() { setEditing(null); setModalOpen(true); }
  function openEdit(transaction: Transaction) { setEditing(transaction); setModalOpen(true); }
  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    try { await removeTransaction(deleting._id); setDeleting(null); } finally { setBusy(false); }
  }

  return (
    <>
      <PageHeading eyebrow="Money log" title="Transactions" copy="Every movement, searchable and clean. Add the context now; understand the pattern later." action={<div className="heading-actions"><button className="button secondary" onClick={() => void exportCsv()}><Download size={17} />Export CSV</button><button className="button primary" onClick={openNew}><Plus size={17} />Add transaction</button></div>} />
      <section className="card transactions-card">
        <div className="filter-toolbar">
          <label className="search-field"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search descriptions…" /><kbd>⌘ K</kbd></label>
          <div className="filter-selects"><span><SlidersHorizontal size={16} />Filters</span><select value={type} onChange={(event) => setType(event.target.value)}><option value="all">All types</option><option value="expense">Expenses</option><option value="income">Income</option></select><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="all">All categories</option>{categories.map((category) => <option value={category._id} key={category._id}>{category.name}</option>)}</select></div>
        </div>
        <div className="list-summary"><strong>{filtered.length} transactions</strong><span>Showing all matching activity</span></div>
        {filtered.length ? <div className="transaction-list detailed">{filtered.map((transaction) => <TransactionRow key={transaction._id} transaction={transaction} category={categories.find((category) => category._id === transaction.categoryId)} currency={user?.currency || "LKR"} onEdit={() => openEdit(transaction)} onDelete={() => setDeleting(transaction)} />)}</div> : <EmptyState title="No matching transactions" copy="Try a broader search or add a new entry to this view." action={<button className="button primary compact" onClick={openNew}><Plus size={16} />Add transaction</button>} />}
      </section>
      <TransactionModal open={modalOpen} categories={categories} transaction={editing} onClose={() => setModalOpen(false)} onSave={saveTransaction} />
      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete this transaction?" description="This removes the entry from totals, reports, and budget calculations."><div className="confirm-content"><span className="danger-icon"><Trash2 /></span><strong>{deleting?.description}</strong><p>This action cannot be undone.</p><div className="modal-actions"><button className="button secondary" onClick={() => setDeleting(null)}>Keep it</button><button className="button danger" disabled={busy} onClick={() => void confirmDelete()}>{busy ? "Deleting…" : "Delete transaction"}</button></div></div></Modal>
    </>
  );
}

