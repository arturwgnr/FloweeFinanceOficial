import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import IncomeExpenseChart from "../components/Charts/IncomeExpenseChart";
import ExpensesPieChart from "../components/Charts/ExpensesPieChart";
import InsightsBlock from "../components/InsightsBlock";
import TransactionModal from "../components/TransactionModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import "../styles/pages/Dashboard.css";

const WalletIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
  </svg>
);

const TrendUpIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);

const TrendDownIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

function StatCard({ label, value, icon, iconClass }) {
  return (
    <div className="stat-card">
      <div className={`stat-card__icon ${iconClass}`}>{icon}</div>
      <div>
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
      </div>
    </div>
  );
}

function RecentTxRow({ tx, currencySymbol, onEdit, onDelete }) {
  const isIncome = tx.type === "INCOME";
  const date = new Date(tx.date);
  return (
    <div className="dashboard__recent-row">
      <div className={`dashboard__recent-row__icon ${isIncome ? "dashboard__recent-row__icon--income" : "dashboard__recent-row__icon--expense"}`}>
        <span>{isIncome ? "↑" : "↓"}</span>
      </div>
      <div className="dashboard__recent-row__info">
        <p className="dashboard__recent-row__desc">{tx.description || tx.category}</p>
        <p className="dashboard__recent-row__meta">
          {tx.category} · {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      </div>
      <span className={`dashboard__recent-row__amount ${isIncome ? "dashboard__recent-row__amount--income" : "dashboard__recent-row__amount--expense"}`}>
        {isIncome ? "+" : "-"}{currencySymbol}{tx.amount.toFixed(2)}
      </span>
      <div className="dashboard__recent-row__actions">
        <button
          className="dashboard__recent-row__btn"
          onClick={() => onEdit(tx)}
          aria-label="Edit transaction"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          className="dashboard__recent-row__btn dashboard__recent-row__btn--delete"
          onClick={() => onDelete(tx.id)}
          aria-label="Delete transaction"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, currencySymbol } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear;

  const selectedMonthLabel = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString(
    "default",
    { month: "long", year: "numeric" }
  );

  function goToPreviousMonth() {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (isCurrentMonth) return;
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  }

  async function confirmDelete() {
    setDeleteLoading(true);
    try {
      await api.delete(`/transactions/${deleteId}`);
      toast.success("Transaction deleted");
      setDeleteId(null);
      refreshData();
    } catch (err) {
      toast.error("Failed to delete transaction");
    } finally {
      setDeleteLoading(false);
    }
  }

  function refreshData() {
    setLoading(true);
    Promise.all([
      api.get(`/transactions?year=${currentYear}&excludeFuture=true`),
      api.get(`/transactions?excludeFuture=true`),
    ])
      .then(([yearRes, allRes]) => {
        setTransactions(yearRes.data.transactions || []);
        setAllTransactions(allRes.data.transactions || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const [yearRes, allRes] = await Promise.all([
          api.get(`/transactions?year=${currentYear}&excludeFuture=true`),
          api.get(`/transactions?excludeFuture=true`),
        ]);
        setTransactions(yearRes.data.transactions || []);
        setAllTransactions(allRes.data.transactions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentYear]);

  const allTimeBalance = useMemo(() => {
    const income = allTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((s, t) => s + t.amount, 0);
    const expenses = allTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((s, t) => s + t.amount, 0);
    return income - expenses;
  }, [allTransactions]);

  // monthStats, recentTx, pieChartData all respond to selectedMonth/selectedYear
  // and use allTransactions so navigation works across year boundaries
  const monthStats = useMemo(() => {
    const filtered = allTransactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
    });
    const income = filtered
      .filter((t) => t.type === "INCOME")
      .reduce((s, t) => s + t.amount, 0);
    const expenses = filtered
      .filter((t) => t.type === "EXPENSE")
      .reduce((s, t) => s + t.amount, 0);
    return { income, expenses };
  }, [allTransactions, selectedMonth, selectedYear]);

  const recentTx = useMemo(() => {
    return allTransactions
      .filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
  }, [allTransactions, selectedMonth, selectedYear]);

  // Line chart always shows last 6 months from today (not affected by navigation)
  const lineChartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(currentYear, now.getMonth() - (5 - i), 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const label = d.toLocaleString("default", { month: "short" });

      const monthTx = transactions.filter((t) => {
        const td = new Date(t.date);
        return td.getMonth() + 1 === m && td.getFullYear() === y;
      });

      return {
        month: label,
        income: monthTx
          .filter((t) => t.type === "INCOME")
          .reduce((s, t) => s + t.amount, 0),
        expenses: monthTx
          .filter((t) => t.type === "EXPENSE")
          .reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [transactions, currentMonth, currentYear]);

  const pieChartData = useMemo(() => {
    const filtered = allTransactions.filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === "EXPENSE" &&
        d.getMonth() + 1 === selectedMonth &&
        d.getFullYear() === selectedYear
      );
    });

    const byCategory = {};
    filtered.forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });

    return Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [allTransactions, selectedMonth, selectedYear]);

  function fmt(n) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: user?.preferredCurrency || "USD",
      maximumFractionDigits: 0,
    }).format(n);
  }

  const monthlyBudget = user?.monthlyBudget;
  const budgetPct =
    monthlyBudget > 0
      ? Math.min((monthStats.expenses / monthlyBudget) * 100, 100)
      : 0;
  const isOverBudget = monthlyBudget > 0 && monthStats.expenses > monthlyBudget;

  return (
    <div className="dashboard">
      <div className="header-div">
        <div className="header-right">
          <h1 className="dashboard__greeting">
            Good{" "}
            {now.getHours() < 12
              ? "morning"
              : now.getHours() < 18
                ? "afternoon"
                : "evening"}
            , {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="dashboard__subtitle">
            Here's your financial overview for {selectedMonthLabel}
          </p>
          {/* Month navigation */}
          <div className="dashboard__month-nav">
            <button
              onClick={goToPreviousMonth}
              className="dashboard__month-nav__btn"
              aria-label="Previous month"
            >
              <ChevronLeftIcon />
            </button>
            <span className="dashboard__month-nav__label">{selectedMonthLabel}</span>
            <button
              onClick={goToNextMonth}
              disabled={isCurrentMonth}
              className="dashboard__month-nav__btn"
              aria-label="Next month"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>

        <div className="header-left">
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            Add Transaction
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="dashboard__stats">
        <StatCard
          label="Current Balance"
          value={loading ? "..." : fmt(allTimeBalance)}
          icon={<WalletIcon />}
          iconClass="stat-card__icon--balance"
        />
        <StatCard
          label="Total Income"
          value={loading ? "..." : fmt(monthStats.income)}
          icon={<TrendUpIcon />}
          iconClass="stat-card__icon--income"
        />
        <StatCard
          label="Total Expenses"
          value={loading ? "..." : fmt(monthStats.expenses)}
          icon={<TrendDownIcon />}
          iconClass="stat-card__icon--expense"
        />
      </div>

      {/* Monthly Budget Widget */}
      <div className={`dashboard__budget-widget card${isOverBudget ? " dashboard__budget-widget--warning" : ""}`}>
        {monthlyBudget ? (
          <>
            <div className="dashboard__budget-widget__header">
              <h3 className="dashboard__budget-widget__title">Monthly Budget</h3>
              <span className={`dashboard__budget-widget__pct${isOverBudget ? " dashboard__budget-widget__pct--over" : ""}`}>
                {budgetPct.toFixed(0)}% used
              </span>
            </div>
            <div className="dashboard__budget-widget__amounts">
              <span>{fmt(monthStats.expenses)} <span className="dashboard__budget-widget__amounts-label">spent</span></span>
              <span className="dashboard__budget-widget__amounts-label">of {fmt(monthlyBudget)} budget</span>
            </div>
            <div className="dashboard__budget-widget__track">
              <div
                className={`dashboard__budget-widget__fill${isOverBudget ? " dashboard__budget-widget__fill--over" : ""}`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
            {isOverBudget && (
              <p className="dashboard__budget-widget__warning-text">
                Over budget by {fmt(monthStats.expenses - monthlyBudget)}
              </p>
            )}
          </>
        ) : (
          <div className="dashboard__budget-widget__empty">
            <p className="dashboard__budget-widget__empty-text">No monthly budget set.</p>
            <Link to="/profile" className="dashboard__budget-widget__link">
              Set your monthly budget in Profile →
            </Link>
          </div>
        )}
      </div>

      {/* Charts row */}
      <div className="dashboard__charts">
        <div className="card">
          <h3 className="dashboard__chart-title">
            Income vs Expenses (6 months)
          </h3>
          {loading ? (
            <div className="dashboard__chart-loading">
              <div className="spinner spinner--sm" />
            </div>
          ) : (
            <IncomeExpenseChart data={lineChartData} />
          )}
        </div>
        <div className="card">
          <h3 className="dashboard__chart-title">
            Expenses by Category
            {!isCurrentMonth && (
              <span className="dashboard__chart-title__month"> — {selectedMonthLabel}</span>
            )}
          </h3>
          {loading ? (
            <div className="dashboard__chart-loading">
              <div className="spinner spinner--sm" />
            </div>
          ) : (
            <ExpensesPieChart data={pieChartData} />
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="dashboard__recent card">
        <div className="dashboard__recent-header">
          <h3 className="dashboard__section-title">
            Recent Transactions
            {!isCurrentMonth && (
              <span className="dashboard__section-title__month"> — {selectedMonthLabel}</span>
            )}
          </h3>
          <Link to="/transactions" className="dashboard__view-all">View all →</Link>
        </div>
        {loading ? (
          <div className="dashboard__chart-loading">
            <div className="spinner spinner--sm" />
          </div>
        ) : recentTx.length === 0 ? (
          <p className="dashboard__recent-empty">No transactions for {selectedMonthLabel}.</p>
        ) : (
          <div className="dashboard__recent-list">
            {recentTx.map((tx) => (
              <RecentTxRow
                key={tx.id}
                tx={tx}
                currencySymbol={currencySymbol}
                onEdit={(t) => setEditingTx(t)}
                onDelete={(id) => setDeleteId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* AI Insights */}
      <InsightsBlock />

      <TransactionModal
        isOpen={modalOpen || !!editingTx}
        onClose={() => { setModalOpen(false); setEditingTx(null); }}
        onSave={() => { setModalOpen(false); setEditingTx(null); refreshData(); }}
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
