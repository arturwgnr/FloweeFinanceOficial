import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import '../styles/pages/Profile.css';

function CategorySection({ type, label, categories, onAdd, onRename, onDelete }) {
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await onAdd(newName.trim(), type);
      setNewName('');
    } finally {
      setAdding(false);
    }
  }

  function startEdit(cat) {
    setEditingId(cat.id);
    setEditingName(cat.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName('');
  }

  async function saveEdit() {
    if (!editingName.trim()) return;
    await onRename(editingId, editingName.trim());
    setEditingId(null);
    setEditingName('');
  }

  async function confirmDelete() {
    setDeleteLoading(true);
    try {
      await onDelete(deletingId);
      setDeletingId(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="profile__card card">
      <div className="profile__section">
        <h2 className="profile__section-title">{label}</h2>

        <ul className="profile__category-list">
          {categories.map((cat) => (
            <li key={cat.id} className="profile__category-item">
              {editingId === cat.id ? (
                <div className="profile__category-edit-row">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                    className="input profile__category-edit-input"
                    autoFocus
                  />
                  <button type="button" onClick={saveEdit} className="btn-primary profile__category-save-btn">
                    Save
                  </button>
                  <button type="button" onClick={cancelEdit} className="btn-secondary profile__category-save-btn">
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span className="profile__category-item__name">{cat.name}</span>
                  <div className="profile__category-item__actions">
                    <button
                      type="button"
                      onClick={() => startEdit(cat)}
                      className="profile__category-btn"
                      aria-label="Rename category"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(cat.id)}
                      className="profile__category-btn profile__category-btn--delete"
                      aria-label="Delete category"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
          {categories.length === 0 && (
            <li className="profile__category-empty">No categories yet.</li>
          )}
        </ul>

        <div className="profile__category-add-row">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            className="input profile__category-add-input"
            placeholder="New category name"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding || !newName.trim()}
            className="btn-primary"
          >
            Add
          </button>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={!!deletingId}
        onCancel={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}

function ChangePasswordSection() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.put('/profile/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password updated');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="profile__card card">
      <form onSubmit={handleSubmit} className="profile__form">
        <div className="profile__section">
          <h2 className="profile__section-title">Change Password</h2>

          {error && <div className="profile__error">{error}</div>}

          <div className="profile__field">
            <label className="label" htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              className="input"
              required
              autoComplete="current-password"
            />
          </div>

          <div className="profile__field">
            <label className="label" htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className="input"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="profile__field">
            <label className="label" htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="input"
              required
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="profile__actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}

function TagsSummarySection() {
  const { user } = useAuth();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tags')
      .then((res) => setTags(res.data.tags || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function fmt(n) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.preferredCurrency || 'USD',
      maximumFractionDigits: 2,
    }).format(n);
  }

  const incomeTags = tags.filter((t) => t.income.count > 0);
  const expenseTags = tags.filter((t) => t.expense.count > 0);

  if (loading) {
    return (
      <div className="profile__card card">
        <div className="profile__section">
          <h2 className="profile__section-title">Transaction Tags</h2>
          <div className="profile__tags-loading"><div className="spinner spinner--sm" /></div>
        </div>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="profile__card card">
        <div className="profile__section">
          <h2 className="profile__section-title">Transaction Tags</h2>
          <p className="profile__category-empty">No tags yet. Add tags when creating transactions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile__card card">
      <div className="profile__section">
        <h2 className="profile__section-title">Transaction Tags</h2>
        <p className="profile__field-hint">Tags let you track totals across transactions regardless of category.</p>

        {expenseTags.length > 0 && (
          <div className="profile__tags-group">
            <h3 className="profile__tags-group-title">Expense Tags</h3>
            <table className="profile__tags-table">
              <thead>
                <tr>
                  <th>Tag</th>
                  <th>Transactions</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {expenseTags.map((tag) => (
                  <tr key={tag.id} className="profile__tag-row">
                    <td className="profile__tag-name">{tag.name}</td>
                    <td className="profile__tag-count">{tag.expense.count}</td>
                    <td className="profile__tag-total profile__tag-total--expense">{fmt(tag.expense.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {incomeTags.length > 0 && (
          <div className="profile__tags-group">
            <h3 className="profile__tags-group-title">Income Tags</h3>
            <table className="profile__tags-table">
              <thead>
                <tr>
                  <th>Tag</th>
                  <th>Transactions</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {incomeTags.map((tag) => (
                  <tr key={tag.id} className="profile__tag-row">
                    <td className="profile__tag-name">{tag.name}</td>
                    <td className="profile__tag-count">{tag.income.count}</td>
                    <td className="profile__tag-total profile__tag-total--income">{fmt(tag.income.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    preferredCurrency: 'USD',
    monthlyBudget: '',
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState({ EXPENSE: [], INCOME: [] });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        preferredCurrency: user.preferredCurrency || 'USD',
        monthlyBudget: user.monthlyBudget != null ? String(user.monthlyBudget) : '',
      });
    }
  }, [user]);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories || { EXPENSE: [], INCOME: [] });
    } catch {
      // silently fail
    }
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        preferredCurrency: form.preferredCurrency,
        monthlyBudget: form.monthlyBudget === '' ? null : parseFloat(form.monthlyBudget),
      };
      const res = await api.put('/profile', payload);
      updateUser(res.data.user);
      toast.success('Profile saved');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCategory(name, type) {
    try {
      await api.post('/categories', { name, type });
      await fetchCategories();
      toast.success('Category added');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add category');
      throw err;
    }
  }

  async function handleRenameCategory(id, name) {
    try {
      await api.put(`/categories/${id}`, { name });
      await fetchCategories();
      toast.success('Category renamed');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to rename category');
      throw err;
    }
  }

  async function handleDeleteCategory(id) {
    try {
      await api.delete(`/categories/${id}`);
      await fetchCategories();
      toast.success('Category deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete category');
      throw err;
    }
  }

  return (
    <div className="profile">
      <div className="profile__header">
        <h1 className="profile__title">Profile</h1>
        <p className="profile__subtitle">Manage your account settings and preferences</p>
      </div>

      <div className="profile__card card">
        <form onSubmit={handleSubmit} className="profile__form">
          <div className="profile__section">
            <h2 className="profile__section-title">Personal Information</h2>

            <div className="profile__field">
              <label className="label" htmlFor="name">Display Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input"
                placeholder="Your name"
                required
              />
            </div>

            <div className="profile__field">
              <label className="label">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                className="input profile__input--disabled"
                disabled
              />
              <p className="profile__field-hint">Email cannot be changed</p>
            </div>
          </div>

          <div className="profile__section">
            <h2 className="profile__section-title">Preferences</h2>

            <div className="profile__field">
              <label className="label" htmlFor="preferredCurrency">Preferred Currency</label>
              <select
                id="preferredCurrency"
                name="preferredCurrency"
                value={form.preferredCurrency}
                onChange={handleChange}
                className="input"
              >
                <option value="USD">USD ($) — US Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="BRL">BRL (R$) — Brazilian Real</option>
              </select>
            </div>

            <div className="profile__field">
              <label className="label" htmlFor="monthlyBudget">Monthly Budget Goal (optional)</label>
              <input
                id="monthlyBudget"
                type="number"
                name="monthlyBudget"
                value={form.monthlyBudget}
                onChange={handleChange}
                className="input"
                placeholder="e.g. 3000"
                min="0"
                step="0.01"
              />
              <p className="profile__field-hint">Set a monthly spending limit to track on your dashboard</p>
            </div>
          </div>

          <div className="profile__actions">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <ChangePasswordSection />

      <CategorySection
        type="EXPENSE"
        label="Expense Categories"
        categories={categories.EXPENSE}
        onAdd={handleAddCategory}
        onRename={handleRenameCategory}
        onDelete={handleDeleteCategory}
      />

      <CategorySection
        type="INCOME"
        label="Income Categories"
        categories={categories.INCOME}
        onAdd={handleAddCategory}
        onRename={handleRenameCategory}
        onDelete={handleDeleteCategory}
      />

      <TagsSummarySection />
    </div>
  );
}
