import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useModal } from "../context/ModalContext";
import "../styles/components/TransactionModal.css";

const defaultForm = {
  amount: "",
  type: "EXPENSE",
  category: "Food",
  description: "",
  date: new Date().toISOString().split("T")[0],
};

const StarIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

const RecurringIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

export default function TransactionModal({
  isOpen,
  onClose,
  onSave,
  transaction,
}) {
  const { pushModal, popModal } = useModal();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState({ EXPENSE: [], INCOME: [] });
  const [catsLoading, setCatsLoading] = useState(false);
  const [marked, setMarked] = useState(false);

  const [keepOpen, setKeepOpen] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removeFutureConfirm, setRemoveFutureConfirm] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      pushModal();
      return () => popModal();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setCatsLoading(true);
    api.get("/categories")
      .then((res) => {
        const cats = res.data.categories || { EXPENSE: [], INCOME: [] };
        setCategories(cats);
        if (!transaction) {
          setForm((prev) => {
            const first = cats[prev.type]?.[0]?.name;
            return first ? { ...prev, category: first } : prev;
          });
        }
      })
      .catch(() => {})
      .finally(() => setCatsLoading(false));
  }, [isOpen]);

  useEffect(() => {
    if (transaction) {
      setForm({
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description || "",
        date: new Date(transaction.date).toISOString().split("T")[0],
      });
      setMarked(transaction.marked || false);
    } else {
      setForm(defaultForm);
      setMarked(false);
    }
    setError("");
    setRecurring(false);
    setConfirmOpen(false);
    setRemoveFutureConfirm(false);
  }, [transaction, isOpen]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function submitTransaction() {
    setError("");
    setLoading(true);
    try {
      if (transaction?.id) {
        await api.put(`/transactions/${transaction.id}`, { ...form, marked });
        toast.success("Transaction updated");
      } else {
        await api.post("/transactions", { ...form, recurring, marked });
        toast.success(
          recurring ? "Recurring transactions added" : "Transaction added",
        );
      }

      setForm((prev) => ({
        ...defaultForm,
        category: prev.category,
        date: prev.date,
      }));
      setMarked(false);

      onSave();
      // keepOpen only applies when adding new transactions; always close after edit
      if (!keepOpen || transaction?.id) {
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to save transaction";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (recurring && !transaction?.id) {
      setConfirmOpen(true);
      return;
    }
    await submitTransaction();
  }

  async function handleRemoveFutureOccurrences() {
    if (!transaction?.recurringGroupId) return;
    setRemoveLoading(true);
    try {
      await api.delete(`/transactions/group/${transaction.recurringGroupId}`);
      toast.success("Future occurrences removed");
      setRemoveFutureConfirm(false);
      onSave();
      onClose();
    } catch (err) {
      toast.error("Failed to remove future occurrences");
    } finally {
      setRemoveLoading(false);
    }
  }

  function getConfirmMessage() {
    const [y, m] = form.date.split("-").map(Number);
    const label = new Date(y, m - 1, 1).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    return `This transaction will repeat every month starting from ${label}.`;
  }

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="tx-modal__overlay">
        <div className="tx-modal__box">
          <div className="tx-modal__header">
            <h2 className="tx-modal__title">
              {transaction ? "Edit Transaction" : "Add Transaction"}
            </h2>
            <div className="tx-modal__header-actions">
              <button
                type="button"
                onClick={() => setMarked((v) => !v)}
                className={`tx-modal__star-btn${marked ? " tx-modal__star-btn--active" : ""}`}
                aria-label={marked ? "Unmark transaction" : "Mark transaction"}
                title={marked ? "Remove mark" : "Mark as starred"}
              >
                <StarIcon filled={marked} />
              </button>
              <button onClick={onClose} className="tx-modal__close-btn">
                <svg
                  className="tx-modal__close-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="tx-modal__form">
            {error && <div className="tx-modal__error">{error}</div>}

            {/* Recurring notice */}
            {transaction?.recurring && transaction?.recurringGroupId && (
              <div className="tx-modal__recurring-notice">
                <span className="tx-modal__recurring-notice__icon">
                  <RecurringIcon />
                </span>
                <span className="tx-modal__recurring-notice__text">
                  This is a recurring transaction.
                </span>
                <button
                  type="button"
                  className="tx-modal__recurring-remove-btn"
                  onClick={() => setRemoveFutureConfirm(true)}
                >
                  Remove future
                </button>
              </div>
            )}

            {/* Type toggle */}
            <div>
              <label className="label">Type</label>
              <div className="tx-modal__type-toggle">
                {["EXPENSE", "INCOME"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      const firstCat = categories[t]?.[0]?.name || "";
                      setForm((prev) => ({ ...prev, type: t, category: firstCat }));
                    }}
                    className={`tx-modal__type-btn ${
                      form.type === t
                        ? t === "INCOME"
                          ? "tx-modal__type-btn--income"
                          : "tx-modal__type-btn--expense"
                        : ""
                    }`}
                  >
                    {t === "INCOME" ? "↑ Income" : "↓ Expense"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="amount">
                Amount ($)
              </label>
              <input
                id="amount"
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                className="input"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="input"
                disabled={catsLoading}
              >
                {(categories[form.type] || []).map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="description">
                Description (optional)
              </label>
              <input
                id="description"
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                className="input"
                placeholder="e.g. Grocery shopping"
              />
            </div>

            <div>
              <label className="label" htmlFor="date">
                Date
              </label>
              <input
                id="date"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div className="tx-modal__checkboxes">
              <label className="tx-modal__keep-open">
                <input
                  type="checkbox"
                  checked={keepOpen}
                  onChange={(e) => setKeepOpen(e.target.checked)}
                />
                Keep open after saving
              </label>
              {!transaction && (
                <label className="tx-modal__keep-open">
                  <input
                    type="checkbox"
                    checked={recurring}
                    onChange={(e) => setRecurring(e.target.checked)}
                  />
                  Repeat monthly
                </label>
              )}
            </div>

            <div className="tx-modal__actions">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading
                  ? "Saving..."
                  : transaction
                    ? "Save Changes"
                    : "Add Transaction"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {confirmOpen && (
        <div className="tx-confirm__overlay">
          <div className="tx-confirm__box">
            <p className="tx-confirm__title">Repeat monthly?</p>
            <p className="tx-confirm__message">{getConfirmMessage()}</p>
            <div className="tx-confirm__actions">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  setConfirmOpen(false);
                  await submitTransaction();
                }}
                className="btn-primary flex-1"
              >
                {loading ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {removeFutureConfirm && (
        <div className="tx-confirm__overlay">
          <div className="tx-confirm__box">
            <p className="tx-confirm__title">Remove future occurrences?</p>
            <p className="tx-confirm__message">
              All future entries in this recurring series (after today) will be permanently deleted.
            </p>
            <div className="tx-confirm__actions">
              <button
                type="button"
                onClick={() => setRemoveFutureConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={removeLoading}
                onClick={handleRemoveFutureOccurrences}
                className="btn-danger flex-1"
              >
                {removeLoading ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
