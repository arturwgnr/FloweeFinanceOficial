import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import TransactionModal from "../components/TransactionModal";
import "../styles/pages/Transactions.css";

const CATEGORIES = [
  "All",
  "Food",
  "Transport",
  "Housing",
  "Health",
  "Entertainment",
  "Shopping",
  "Education",
  "Other",
];

function TransactionRow({ transaction, onEdit, onDelete }) {
  const isIncome = transaction.type === "INCOME";
  const date = new Date(transaction.date);

  return (
    <div className="tx-row">
      <div className="tx-row__left">
        <div
          className={`tx-row__icon ${isIncome ? "bg-green-100" : "bg-red-100"}`}
        >
          <span className="text-base">{isIncome ? "↑" : "↓"}</span>
        </div>
        <div className="tx-row__info">
          <p className="tx-row__desc">
            {transaction.description || transaction.category}
          </p>
          <p className="tx-row__meta">
            {transaction.category} ·{" "}
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="tx-row__right">
        <span
          className={`font-semibold text-sm ${isIncome ? "text-green-600" : "text-red-500"}`}
        >
          {isIncome ? "+" : "-"}${transaction.amount.toFixed(2)}
        </span>
        <button
          onClick={() => onEdit(transaction)}
          className="tx-row__edit-btn"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          onClick={() => onDelete(transaction.id)}
          className="tx-row__delete-btn"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  const now = new Date();
  const [filters, setFilters] = useState({
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear()),
    type: "",
    category: "",
  });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.month) params.append("month", filters.month);
      if (filters.year) params.append("year", filters.year);
      if (filters.type) params.append("type", filters.type);
      if (filters.category && filters.category !== "All")
        params.append("category", filters.category);
      const res = await api.get(`/transactions?${params}`);
      setTransactions(res.data.transactions || []);
    } catch (err) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  function openCreate() {
    setEditingTx(null);
    setModalOpen(true);
  }

  function openEdit(tx) {
    setEditingTx(tx);
    setModalOpen(true);
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/transactions/${id}`);
      toast.success("Transaction deleted");
      fetchTransactions();
    } catch (err) {
      toast.error("Failed to delete transaction");
    }
  }

  const months = [
    { v: "", l: "All months" },
    ...Array.from({ length: 12 }, (_, i) => ({
      v: String(i + 1),
      l: new Date(2000, i).toLocaleString("default", { month: "long" }),
    })),
  ];

  const currentYear = now.getFullYear();
  const years = [
    String(currentYear),
    String(currentYear - 1),
    String(currentYear - 2),
  ];

  return (
    <div className="space-y-6">
      <div className="transactions__header">
        <div>
          <h1 className="transactions__title">Transactions</h1>
          <p className="transactions__subtitle">
            {transactions.length} transactions found
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary flex items-center gap-2"
        >
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="transactions__filters">
          <select
            value={filters.month}
            onChange={(e) =>
              setFilters((p) => ({ ...p, month: e.target.value }))
            }
            className="input w-auto"
          >
            {months.map((m) => (
              <option key={m.v} value={m.v}>
                {m.l}
              </option>
            ))}
          </select>
          <select
            value={filters.year}
            onChange={(e) =>
              setFilters((p) => ({ ...p, year: e.target.value }))
            }
            className="input w-auto"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={filters.type}
            onChange={(e) =>
              setFilters((p) => ({ ...p, type: e.target.value }))
            }
            className="input w-auto"
          >
            <option value="">All types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters((p) => ({ ...p, category: e.target.value }))
            }
            className="input w-auto"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="transactions__list-card">
        {loading ? (
          <div className="transactions__loading">
            <div className="spinner spinner--sm" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="transactions__empty">
            <p className="text-4xl mb-3">📋</p>
            <p className="transactions__empty-title">No transactions found</p>
            <p className="transactions__empty-sub">
              Try changing the filters or add a new transaction
            </p>
          </div>
        ) : (
          <div className="transactions__rows">
            {transactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={fetchTransactions}
        transaction={editingTx}
      />
    </div>
  );
}
