import { CirclePlus, Lock, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Modal } from "../components/Modal";
import { PageHeading } from "../components/Ui";
import { useFinance } from "../context/FinanceContext";
import type { Category, TransactionType } from "../types";

const colors = ["#4d9f8b", "#5b8def", "#8f6ad8", "#df7c65", "#d4a33f", "#c05f83", "#607dbd", "#566b67"];

export function CategoriesPage() {
  const { categories, transactions, addCategory, removeCategory } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [color, setColor] = useState(colors[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<Category | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await addCategory({ name, type, color, icon: "circle" });
      setModalOpen(false);
      setName("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not add category.");
    } finally { setSaving(false); }
  }

  async function confirmDelete() {
    if (!deleting) return;
    await removeCategory(deleting._id);
    setDeleting(null);
  }

  function categoryGroup(groupType: TransactionType) {
    return categories.filter((category) => category.type === groupType).map((category) => {
      const count = transactions.filter((transaction) => transaction.categoryId === category._id).length;
      return <article className="card category-card" key={category._id}><span className="category-swatch" style={{ background: category.color }}><CirclePlus size={19} /></span><div><h3>{category.name}</h3><p>{count} transaction{count === 1 ? "" : "s"}</p></div>{category.isDefault ? <span className="locked-label"><Lock size={13} />Default</span> : <button className="icon-button danger-soft" onClick={() => setDeleting(category)} aria-label={`Delete ${category.name}`}><Trash2 size={16} /></button>}</article>;
    });
  }

  return (
    <>
      <PageHeading eyebrow="Your financial language" title="Categories" copy="Organize money in a way that matches real life—not a generic spreadsheet." action={<button className="button primary" onClick={() => setModalOpen(true)}><Plus size={17} />New category</button>} />
      <div className="category-section"><div className="section-title-row"><div><h2>Expense categories</h2><p>Where your money goes.</p></div><span>{categories.filter((category) => category.type === "expense").length} categories</span></div><section className="category-grid">{categoryGroup("expense")}</section></div>
      <div className="category-section"><div className="section-title-row"><div><h2>Income categories</h2><p>Where your money comes from.</p></div><span>{categories.filter((category) => category.type === "income").length} categories</span></div><section className="category-grid">{categoryGroup("income")}</section></div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create a category" description="Choose a short, clear name you will recognize in reports."><form className="form-stack" onSubmit={submit}><label className="field">Category name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Pets" required minLength={2} /></label><div className="segmented-control"><button type="button" className={type === "expense" ? "active" : ""} onClick={() => setType("expense")}>Expense</button><button type="button" className={type === "income" ? "active" : ""} onClick={() => setType("income")}>Income</button></div><fieldset className="color-picker"><legend>Color</legend>{colors.map((value) => <button type="button" key={value} className={color === value ? "selected" : ""} style={{ background: value }} onClick={() => setColor(value)} aria-label={`Use color ${value}`} />)}</fieldset>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="button secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="button primary" disabled={saving}>{saving ? "Creating…" : "Create category"}</button></div></form></Modal>
      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete custom category?" description="Existing transactions will remain, but this label will no longer be available for new entries."><div className="confirm-content"><span className="danger-icon"><Trash2 /></span><strong>{deleting?.name}</strong><div className="modal-actions"><button className="button secondary" onClick={() => setDeleting(null)}>Cancel</button><button className="button danger" onClick={() => void confirmDelete()}>Delete category</button></div></div></Modal>
    </>
  );
}

