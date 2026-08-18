import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Category, Transaction, TransactionInput, TransactionType } from "../types";
import { Modal } from "./Modal";

interface TransactionModalProps {
  open: boolean;
  categories: Category[];
  transaction?: Transaction | null;
  onClose: () => void;
  onSave: (values: TransactionInput, id?: string) => Promise<void>;
}

const today = () => new Date().toISOString().slice(0, 10);

export function TransactionModal({ open, categories, transaction, onClose, onSave }: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(today());
  const [paymentMethod, setPaymentMethod] = useState<Transaction["paymentMethod"]>("card");
  const [recurring, setRecurring] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const available = useMemo(() => categories.filter((category) => category.type === type), [categories, type]);

  useEffect(() => {
    if (!open) return;
    const nextType = transaction?.type || "expense";
    setType(nextType);
    setAmount(transaction ? String(transaction.amount) : "");
    setDescription(transaction?.description || "");
    setCategoryId(transaction?.categoryId || categories.find((category) => category.type === nextType)?._id || "");
    setDate(transaction?.date.slice(0, 10) || today());
    setPaymentMethod(transaction?.paymentMethod || "card");
    setRecurring(transaction?.recurring || false);
    setError("");
  }, [open, transaction, categories]);

  function changeType(nextType: TransactionType) {
    setType(nextType);
    setCategoryId(categories.find((category) => category.type === nextType)?._id || "");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!description.trim() || !categoryId || Number(amount) <= 0) {
      setError("Add a description, positive amount, and category.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({
        type,
        amount: Number(amount),
        description: description.trim(),
        categoryId,
        date,
        paymentMethod,
        recurring,
      }, transaction?._id);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save the transaction.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={transaction ? "Edit transaction" : "Add transaction"}
      description="Keep the details tidy now so your reports stay useful later."
    >
      <form className="form-stack" onSubmit={submit}>
        <div className="segmented-control" aria-label="Transaction type">
          <button type="button" className={type === "expense" ? "active" : ""} onClick={() => changeType("expense")}>Expense</button>
          <button type="button" className={type === "income" ? "active" : ""} onClick={() => changeType("income")}>Income</button>
        </div>
        <div className="amount-field">
          <label htmlFor="amount">Amount</label>
          <div><span>Rs.</span><input id="amount" type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" autoFocus /></div>
        </div>
        <div className="field-grid two">
          <label className="field">Description<input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="e.g. Weekly groceries" /></label>
          <label className="field">Category<select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>{available.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label>
        </div>
        <div className="field-grid two">
          <label className="field">Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
          <label className="field">Payment<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as Transaction["paymentMethod"])}><option value="card">Card</option><option value="bank">Bank transfer</option><option value="cash">Cash</option><option value="wallet">Digital wallet</option></select></label>
        </div>
        <label className="check-row"><input type="checkbox" checked={recurring} onChange={(event) => setRecurring(event.target.checked)} /><span><strong>Recurring transaction</strong><small>Mark regular payments and income for better forecasting.</small></span></label>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" disabled={saving}>{saving ? "Saving…" : transaction ? "Save changes" : "Add transaction"}</button></div>
      </form>
    </Modal>
  );
}

