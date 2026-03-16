import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import BudgetCard from '../components/BudgetCard';
import '../styles/pages/Budgets.css';

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Shopping', 'Education', 'Other'];

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');

  const now = new Date();
  const [form, setForm] = useState({
    category: 'Food',
    monthlyLimit: '',
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear()),
  });

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/budgets');
      setBudgets(res.data.budgets || []);
    } catch (err) {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/budgets', form);
      setForm({ category: 'Food', monthlyLimit: '', month: String(now.getMonth() + 1), year: String(now.getFullYear()) });
      setShowForm(false);
      fetchBudgets();
      toast.success('Budget saved');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save budget';
      setFormError(msg);
      toast.error(msg);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/budgets/${id}`);
      toast.success('Budget deleted');
      fetchBudgets();
    } catch (err) {
      toast.error('Failed to delete budget');
    }
  }

  const months = Array.from({ length: 12 }, (_, i) => ({
    v: String(i + 1),
    l: new Date(2000, i).toLocaleString('default', { month: 'long' }),
  }));

  const currentYear = now.getFullYear();
  const years = [String(currentYear), String(currentYear - 1), String(currentYear + 1)];

  return (
    <div className="space-y-6">
      <div className="budgets__header">
        <div>
          <h1 className="budgets__title">Budgets</h1>
          <p className="budgets__subtitle">Set monthly spending limits per category</p>
        </div>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Budget
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="budgets__form-card">
          <h3 className="budgets__form-title">New Budget</h3>
          {formError && (
            <div className="budgets__form-error">{formError}</div>
          )}
          <form onSubmit={handleSubmit} className="budgets__form-grid">
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="input">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Monthly Limit ($)</label>
              <input
                type="number"
                value={form.monthlyLimit}
                onChange={(e) => setForm((p) => ({ ...p, monthlyLimit: e.target.value }))}
                className="input"
                placeholder="500"
                min="1"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="label">Month</label>
              <select value={form.month} onChange={(e) => setForm((p) => ({ ...p, month: e.target.value }))} className="input">
                {months.map((m) => <option key={m.v} value={m.v}>{m.l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Year</label>
              <select value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} className="input">
                {years.map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-3">✕</button>
            </div>
          </form>
        </div>
      )}

      {/* Budget grid */}
      {loading ? (
        <div className="budgets__loading">
          <div className="spinner spinner--sm" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="budgets__empty">
          <p className="text-4xl mb-3">📊</p>
          <p className="budgets__empty-title">No budgets yet</p>
          <p className="budgets__empty-sub">Add a budget to start tracking your spending limits</p>
        </div>
      ) : (
        <div className="budgets__grid">
          {budgets.map((b) => (
            <BudgetCard key={b.id} budget={b} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
