import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import GoalCard from '../components/GoalCard';
import '../styles/pages/Goals.css';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ name: '', targetAmount: '', deadline: '' });

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/goals');
      setGoals(res.data.goals || []);
    } catch (err) {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/goals', form);
      setForm({ name: '', targetAmount: '', deadline: '' });
      setShowForm(false);
      fetchGoals();
      toast.success('Goal created');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create goal';
      setFormError(msg);
      toast.error(msg);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/goals/${id}`);
      toast.success('Goal deleted');
      fetchGoals();
    } catch (err) {
      toast.error('Failed to delete goal');
    }
  }

  return (
    <div className="space-y-6">
      <div className="goals__header">
        <div>
          <h1 className="goals__title">Savings Goals</h1>
          <p className="goals__subtitle">Track your progress toward financial milestones</p>
        </div>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Goal
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="goals__form-card">
          <h3 className="goals__form-title">Create New Goal</h3>
          {formError && (
            <div className="goals__form-error">{formError}</div>
          )}
          <form onSubmit={handleSubmit} className="goals__form-grid">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="label">Goal Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="input"
                placeholder="e.g. Emergency Fund"
                required
              />
            </div>
            <div>
              <label className="label">Target Amount ($)</label>
              <input
                type="number"
                value={form.targetAmount}
                onChange={(e) => setForm((p) => ({ ...p, targetAmount: e.target.value }))}
                className="input"
                placeholder="10000"
                min="1"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="label">Deadline (optional)</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
                className="input"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-3">✕</button>
            </div>
          </form>
        </div>
      )}

      {/* Goals grid */}
      {loading ? (
        <div className="goals__loading">
          <div className="spinner spinner--sm" />
        </div>
      ) : goals.length === 0 ? (
        <div className="goals__empty">
          <p className="text-4xl mb-3">🎯</p>
          <p className="goals__empty-title">No goals yet</p>
          <p className="goals__empty-sub">Create your first savings goal to get started</p>
        </div>
      ) : (
        <div className="goals__grid">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} onUpdate={fetchGoals} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
