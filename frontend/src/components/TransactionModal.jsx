import React, { useState, useEffect, useRef } from "react";
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

  // Tags state
  const [tagNames, setTagNames] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [allTags, setAllTags] = useState([]);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const tagInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      pushModal();
      return () => popModal();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setCatsLoading(true);
    Promise.all([
      api.get("/categories"),
      api.get("/tags"),
    ])
      .then(([catsRes, tagsRes]) => {
        const cats = catsRes.data.categories || { EXPENSE: [], INCOME: [] };
        setCategories(cats);
        setAllTags(tagsRes.data.tags || []);
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

  const [keepOpen, setKeepOpen] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (transaction) {
      setForm({
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description || "",
        date: new Date(transaction.date).toISOString().split("T")[0],
      });
      setTagNames(transaction.tags ? transaction.tags.map((t) => t.name) : []);
    } else {
      setForm(defaultForm);
      setTagNames([]);
    }
    setError("");
    setRecurring(false);
    setConfirmOpen(false);
    setTagInput("");
    setShowSuggestions(false);
  }, [transaction, isOpen]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleTagInputChange(e) {
    const val = e.target.value;
    setTagInput(val);
    if (val.trim().length > 0) {
      const q = val.trim().toLowerCase();
      const filtered = allTags.filter(
        (t) =>
          t.name.toLowerCase().includes(q) &&
          !tagNames.includes(t.name)
      );
      setTagSuggestions(filtered.slice(0, 6));
      setShowSuggestions(filtered.length > 0);
    } else {
      setTagSuggestions([]);
      setShowSuggestions(false);
    }
  }

  function addTag(name) {
    const trimmed = name.trim();
    if (!trimmed || tagNames.includes(trimmed)) return;
    setTagNames((prev) => [...prev, trimmed]);
    setTagInput("");
    setTagSuggestions([]);
    setShowSuggestions(false);
    tagInputRef.current?.focus();
  }

  function handleTagKeyDown(e) {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && tagInput === "" && tagNames.length > 0) {
      setTagNames((prev) => prev.slice(0, -1));
    }
  }

  function removeTag(name) {
    setTagNames((prev) => prev.filter((t) => t !== name));
  }

  async function submitTransaction() {
    setError("");
    setLoading(true);
    try {
      if (transaction?.id) {
        await api.put(`/transactions/${transaction.id}`, { ...form, tagNames });
        toast.success("Transaction updated");
      } else {
        await api.post("/transactions", { ...form, recurring, tagNames });
        toast.success(
          recurring ? "Recurring transactions added" : "Transaction added",
        );
      }

      setForm((prev) => ({
        ...defaultForm,
        category: prev.category,
        date: prev.date,
      }));
      setTagNames([]);

      onSave();
      if (!keepOpen) onClose();
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

  function getConfirmMessage() {
    const [y, m] = form.date.split("-").map(Number);
    const label = new Date(y, m - 1, 1).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    return `This transaction will repeat every month starting from ${label}. You can delete future occurrences individually.`;
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

          <form onSubmit={handleSubmit} className="tx-modal__form">
            {error && <div className="tx-modal__error">{error}</div>}

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

            {/* Tags field */}
            <div className="tx-modal__tags-area">
              <label className="label">Tags (optional)</label>
              <div className="tx-modal__tag-chips-input" onClick={() => tagInputRef.current?.focus()}>
                {tagNames.map((name) => (
                  <span key={name} className="tx-modal__chip">
                    {name}
                    <button
                      type="button"
                      className="tx-modal__chip-remove"
                      onClick={(e) => { e.stopPropagation(); removeTag(name); }}
                      aria-label={`Remove tag ${name}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  ref={tagInputRef}
                  type="text"
                  className="tx-modal__tag-input"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder={tagNames.length === 0 ? "Add tags..." : ""}
                />
              </div>
              {showSuggestions && (
                <ul className="tx-modal__tag-suggestions">
                  {tagSuggestions.map((tag) => (
                    <li
                      key={tag.id}
                      className="tx-modal__tag-suggestion-item"
                      onMouseDown={() => addTag(tag.name)}
                    >
                      {tag.name}
                    </li>
                  ))}
                </ul>
              )}
              <p className="tx-modal__tag-hint">Press Enter or comma to add a tag</p>
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
    </>,
    document.body
  );
}
