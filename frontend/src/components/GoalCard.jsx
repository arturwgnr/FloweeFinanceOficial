import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/components/GoalCard.css';

export default function GoalCard({ goal, onUpdate, onDelete }) {
  const { currencySymbol } = useAuth();
  const { id, name, targetAmount, currentAmount, deadline } = goal;
  const pct = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;
  const isComplete = currentAmount >= targetAmount;
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    setSaving(true);
    try {
      await api.patch(`/goals/${id}/amount`, { amount: parseFloat(amount) });
      setAmount('');
      onUpdate();
      toast.success('Progress updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update progress');
    } finally {
      setSaving(false);
    }
  }

  const daysLeft = deadline
    ? Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className={`card border ${isComplete ? 'border-primary bg-primary-light' : 'border-gray-100'}`}>
      <div className="goal-card__header">
        <div className="goal-card__info">
          <div className="goal-card__title-row">
            {isComplete && <span className="goal-card__badge">Achieved!</span>}
            <h3 className="goal-card__name">{name}</h3>
          </div>
          {deadline && (
            <p className={`text-xs ${daysLeft !== null && daysLeft < 30 ? 'text-orange-500' : 'text-gray-400'}`}>
              {daysLeft !== null && daysLeft >= 0
                ? `${daysLeft} days left`
                : 'Deadline passed'} · {new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>
        <button onClick={() => onDelete(id)} className="goal-card__delete">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Progress */}
      <div className="goal-card__progress-section">
        <div className="goal-card__progress-labels">
          <span>{currencySymbol}{currentAmount.toFixed(2)} saved</span>
          <span>Goal: {currencySymbol}{targetAmount.toFixed(2)}</span>
        </div>
        <div className="goal-card__progress-track">
          <div
            className="goal-card__progress-fill"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="goal-card__pct">{pct.toFixed(0)}% complete</p>
      </div>

      {/* Add contribution */}
      {!isComplete && (
        <form onSubmit={handleAdd} className="goal-card__form">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input flex-1 text-sm py-1.5"
            placeholder="Add amount..."
            min="0.01"
            step="0.01"
          />
          <button
            type="submit"
            disabled={saving || !amount}
            className="btn-primary text-sm px-3 py-1.5"
          >
            {saving ? '...' : 'Add'}
          </button>
        </form>
      )}
    </div>
  );
}
