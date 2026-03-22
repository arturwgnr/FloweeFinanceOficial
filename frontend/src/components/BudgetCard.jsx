import React from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/components/BudgetCard.css";

const CATEGORY_ICONS = {
  Food: "🍔",
  Transport: "🚗",
  Housing: "🏠",
  Health: "💊",
  Entertainment: "🎬",
  Shopping: "🛍️",
  Education: "📚",
  Travel: "✈️",
  Other: "📦",
};

export default function BudgetCard({ budget, onDelete }) {
  const { currencySymbol } = useAuth();
  const { category, monthlyLimit, spent } = budget;
  const pct =
    monthlyLimit > 0 ? Math.min((spent / monthlyLimit) * 100, 100) : 0;
  const remaining = Math.max(monthlyLimit - spent, 0);
  const isOver = spent > monthlyLimit;

  let barColor = "bg-primary";
  let statusColor = "text-gray-500";
  let bgColor = "";

  if (pct >= 100) {
    barColor = "bg-red-500";
    statusColor = "text-red-600";
    bgColor = "border-red-200 bg-red-50";
  } else if (pct >= 80) {
    barColor = "bg-orange-400";
    statusColor = "text-orange-600";
    bgColor = "border-orange-200 bg-orange-50";
  }

  return (
    <div className={`card border ${bgColor || "border-gray-100"}`}>
      <div className="budget-card__header">
        <div className="budget-card__category">
          <span className="text-2xl">{CATEGORY_ICONS[category] || "📦"}</span>
          <div>
            <h3 className="budget-card__name">{category}</h3>
            <p className="budget-card__date">
              {new Date(0, budget.month - 1).toLocaleString("default", {
                month: "long",
              })}{" "}
              {budget.year}
            </p>
          </div>
        </div>
        <button
          onClick={() => onDelete(budget.id)}
          className="budget-card__delete"
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

      {/* Progress bar */}
      <div className="budget-card__progress-section">
        <div className="budget-card__progress-labels">
          <span>
            Spent:{" "}
            <strong className="text-gray-700">{currencySymbol}{spent.toFixed(2)}</strong>
          </span>
          <span>
            Limit:{" "}
            <strong className="text-gray-700">
              {currencySymbol}{monthlyLimit.toFixed(2)}
            </strong>
          </span>
        </div>
        <div className="budget-card__progress-track">
          <div
            className={`budget-card__progress-fill ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="budget-card__footer">
        <span className={`text-sm font-medium ${statusColor}`}>
          {isOver
            ? `Over budget by ${currencySymbol}${(spent - monthlyLimit).toFixed(2)}`
            : pct >= 80
              ? `⚠️ Almost at limit`
              : `${currencySymbol}${remaining.toFixed(2)} remaining`}
        </span>
        <span className="budget-card__pct">{pct.toFixed(0)}%</span>
      </div>
    </div>
  );
}
