import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import '../styles/components/TransactionModal.css';

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Shopping', 'Education', 'Other'];

const defaultForm = {
  amount: '',
  type: 'EXPENSE',
  category: 'Food',
  description: '',
  date: new Date().toISOString().split('T')[0],
};

export default function TransactionModal({ isOpen, onClose, onSave, transaction }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction) {
      setForm({
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description || '',
        date: new Date(transaction.date).toISOString().split('T')[0],
      });
    } else {
      setForm(defaultForm);
    }
    setError('');
  }, [transaction, isOpen]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (transaction?.id) {
        await api.put(`/transactions/${transaction.id}`, form);
        toast.success('Transaction updated');
      } else {
        await api.post('/transactions', form);
        toast.success('Transaction added');
      }
      onSave();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save transaction';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="tx-modal__overlay">
      <div className="tx-modal__box">
        <div className="tx-modal__header">
          <h2 className="tx-modal__title">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="tx-modal__close-btn">
            <svg className="tx-modal__close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tx-modal__form">
          {error && (
            <div className="tx-modal__error">{error}</div>
          )}

          {/* Type toggle */}
          <div>
            <label className="label">Type</label>
            <div className="tx-modal__type-toggle">
              {['EXPENSE', 'INCOME'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, type: t }))}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    form.type === t
                      ? t === 'INCOME'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t === 'INCOME' ? '↑ Income' : '↓ Expense'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label" htmlFor="amount">Amount ($)</label>
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
            <label className="label" htmlFor="category">Category</label>
            <select id="category" name="category" value={form.category} onChange={handleChange} className="input">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="description">Description (optional)</label>
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
            <label className="label" htmlFor="date">Date</label>
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

          <div className="tx-modal__actions">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : transaction ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
