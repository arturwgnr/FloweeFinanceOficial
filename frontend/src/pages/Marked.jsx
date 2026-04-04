import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import TransactionModal from "../components/TransactionModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import "../styles/pages/Marked.css";

const StarFilledIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

const RecurringIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

function MarkedRow({ transaction, onEdit, onDelete, onUnmark }) {
  const { currencySymbol } = useAuth();
  const isIncome = transaction.type === "INCOME";
  const date = new Date(transaction.date);

  return (
    <div className="marked-row">
      <div className="marked-row__left">
        <div className={`marked-row__icon ${isIncome ? "marked-row__icon--income" : "marked-row__icon--expense"}`}>
          <span>{isIncome ? "↑" : "↓"}</span>
        </div>
        <div className="marked-row__info">
          <p className="marked-row__desc">
            {transaction.description || transaction.category}
            {transaction.recurring && (
              <span className="marked-row__recurring" title="Recurring">
                <RecurringIcon />
              </span>
            )}
          </p>
          <p className="marked-row__meta">
            {transaction.category} ·{" "}
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="marked-row__right">
        <span className={`marked-row__amount ${isIncome ? "marked-row__amount--income" : "marked-row__amount--expense"}`}>
          {isIncome ? "+" : "-"}{currencySymbol}{transaction.amount.toFixed(2)}
        </span>
        <button
          onClick={() => onUnmark(transaction)}
          className="marked-row__unmark-btn"
          title="Remove mark"
          aria-label="Remove mark"
        >
          <StarFilledIcon />
        </button>
        <button onClick={() => onEdit(transaction)} className="marked-row__edit-btn" aria-label="Edit">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button onClick={() => onDelete(transaction.id)} className="marked-row__delete-btn" aria-label="Delete">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function Marked() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTx, setEditingTx] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMarked = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/transactions?marked=true");
      setTransactions(res.data.transactions || []);
    } catch {
      toast.error("Failed to load marked transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarked();
  }, [fetchMarked]);

  async function handleUnmark(tx) {
    try {
      await api.put(`/transactions/${tx.id}`, { marked: false });
      toast.success("Removed from marked");
      fetchMarked();
    } catch {
      toast.error("Failed to update transaction");
    }
  }

  async function confirmDelete() {
    setDeleteLoading(true);
    try {
      await api.delete(`/transactions/${deleteId}`);
      toast.success("Transaction deleted");
      setDeleteId(null);
      fetchMarked();
    } catch {
      toast.error("Failed to delete transaction");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="marked__header">
        <div>
          <h1 className="marked__title">Marked Transactions</h1>
          <p className="marked__subtitle">
            {transactions.length} starred transaction{transactions.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="marked__list-card">
        {loading ? (
          <div className="marked__loading">
            <div className="spinner spinner--sm" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="marked__empty">
            <p className="text-4xl mb-3">⭐</p>
            <p className="marked__empty-title">No marked transactions</p>
            <p className="marked__empty-sub">
              Star a transaction from the edit modal to see it here
            </p>
          </div>
        ) : (
          <div className="marked__rows">
            {transactions.map((tx) => (
              <MarkedRow
                key={tx.id}
                transaction={tx}
                onEdit={(t) => { setEditingTx(t); setModalOpen(true); }}
                onDelete={(id) => setDeleteId(id)}
                onUnmark={handleUnmark}
              />
            ))}
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTx(null); }}
        onSave={fetchMarked}
        transaction={editingTx}
      />

      <DeleteConfirmModal
        isOpen={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
