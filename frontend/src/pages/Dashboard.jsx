import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import IncomeExpenseChart from "../components/Charts/IncomeExpenseChart";
import ExpensesPieChart from "../components/Charts/ExpensesPieChart";
import InsightsBlock from "../components/InsightsBlock";
import "../styles/pages/Dashboard.css";

function StatCard({ label, value, icon, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-card__icon ${color}`}>{icon}</div>
      <div>
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get(`/transactions?year=${currentYear}`);
        setTransactions(res.data.transactions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentYear]);

  const monthStats = useMemo(() => {
    const thisMonth = transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear
      );
    });
    const income = thisMonth
      .filter((t) => t.type === "INCOME")
      .reduce((s, t) => s + t.amount, 0);
    const expenses = thisMonth
      .filter((t) => t.type === "EXPENSE")
      .reduce((s, t) => s + t.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions, currentMonth, currentYear]);

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
    const thisMonthExpenses = transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === "EXPENSE" &&
        d.getMonth() + 1 === currentMonth &&
        d.getFullYear() === currentYear
      );
    });

    const byCategory = {};
    thisMonthExpenses.forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });

    return Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, currentMonth, currentYear]);

  function fmt(n) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  }

  return (
    <div className="dashboard">
      <div>
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
          Here's your financial overview for{" "}
          {now.toLocaleString("default", { month: "long", year: "numeric" })}
        </p>

        <div className="dashboard-right">
          <button>Add Transaction</button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="dashboard__stats">
        <StatCard
          label="Current Balance"
          value={loading ? "..." : fmt(monthStats.balance)}
          icon="💰"
          color="bg-primary-light"
        />
        <StatCard
          label="Total Income"
          value={loading ? "..." : fmt(monthStats.income)}
          icon="📈"
          color="bg-green-100"
        />
        <StatCard
          label="Total Expenses"
          value={loading ? "..." : fmt(monthStats.expenses)}
          icon="📉"
          color="bg-red-100"
        />
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
          <h3 className="dashboard__chart-title">Expenses by Category</h3>
          {loading ? (
            <div className="dashboard__chart-loading">
              <div className="spinner spinner--sm" />
            </div>
          ) : (
            <ExpensesPieChart data={pieChartData} />
          )}
        </div>
      </div>

      {/* AI Insights */}
      <InsightsBlock />
    </div>
  );
}
