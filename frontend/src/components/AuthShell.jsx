import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CircleAlert,
  Eye,
  EyeOff,
  Lightbulb,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

/* Shared layout for the Login and Register pages */
export function AuthShell({ title, subtitle, children, footer, panelTitle, panelText }) {
  return (
    <div className="auth">
      <div className="auth__main">
        <header className="auth__top">
          <Link to="/" className="auth-brand" aria-label="Flowee home">
            <span className="auth-brand__mark" aria-hidden="true">
              ᨒ
            </span>
            <span className="auth-brand__name">Flowee</span>
          </Link>
          <Link to="/" className="auth__back">
            <ArrowLeft size={16} aria-hidden="true" />
            Home
          </Link>
        </header>

        <main className="auth__content">
          <div className="auth__card">
            <h1 className="auth__title">{title}</h1>
            <p className="auth__subtitle">{subtitle}</p>
            {children}
            <p className="auth__switch">{footer}</p>
          </div>
        </main>

        <p className="auth__legal">© {new Date().getFullYear()} Flowee</p>
      </div>

      <aside className="auth__panel">
        <div className="auth__panel-inner">
          <h2 className="auth__panel-title">{panelTitle}</h2>
          <p className="auth__panel-text">{panelText}</p>

          <div className="auth-mock" aria-hidden="true">
            <div className="auth-mock__card auth-mock__card--stats">
              <div className="auth-mock__stat">
                <span className="auth-mock__label">Income</span>
                <span className="auth-mock__value">$6,050</span>
                <span className="auth-mock__trend">
                  <TrendingUp size={11} /> 2.5%
                </span>
              </div>
              <div className="auth-mock__stat">
                <span className="auth-mock__label">Expenses</span>
                <span className="auth-mock__value">$3,120</span>
                <span className="auth-mock__trend">
                  <TrendingDown size={11} /> 14.5%
                </span>
              </div>
              <div className="auth-mock__budget">
                <div className="auth-mock__budget-row">
                  <span>Monthly budget</span>
                  <span>78%</span>
                </div>
                <div className="auth-mock__meter">
                  <span className="auth-mock__meter-fill" />
                </div>
              </div>
            </div>

            <div className="auth-mock__card auth-mock__card--insight">
              <span className="auth-mock__chip">
                <Lightbulb size={12} /> Suggestion
              </span>
              <p className="auth-mock__text">
                Food delivery made up 38% of your Food spending. Two more home
                cooked nights keeps you under budget.
              </p>
            </div>
          </div>

          <ul className="auth__panel-points">
            <li>Dashboard, budgets and savings goals</li>
            <li>Recurring monthly transactions</li>
            <li>Flowee Insights: Suggestion, Blind Spot, Cold Analysis</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

/* Inline server / form-level error */
export function AuthAlert({ children }) {
  if (!children) return null;
  return (
    <div className="auth-alert" role="alert">
      <CircleAlert size={18} aria-hidden="true" />
      <div className="auth-alert__body">{children}</div>
    </div>
  );
}

/* Labelled input with icon, hint and inline error */
export function AuthField({
  id,
  label,
  icon: Icon,
  error,
  hint,
  hintMet,
  type = "text",
  trailing,
  ...inputProps
}) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`auth-field${error ? " auth-field--error" : ""}`}>
      <label className="auth-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="auth-field__control">
        {Icon && <Icon size={18} className="auth-field__icon" aria-hidden="true" />}
        <input
          id={id}
          type={type}
          className={`auth-field__input${trailing ? " auth-field__input--trailing" : ""}`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy || undefined}
          {...inputProps}
        />
        {trailing}
      </div>
      {hint && !error && (
        <p
          id={`${id}-hint`}
          className={`auth-field__hint${hintMet ? " auth-field__hint--met" : ""}`}
        >
          {hintMet && <Check size={14} aria-hidden="true" />}
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="auth-field__error">
          <CircleAlert size={14} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

/* Password input with show / hide toggle */
export function PasswordField(props) {
  const [visible, setVisible] = useState(false);
  return (
    <AuthField
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          className="auth-field__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          aria-controls={props.id}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      }
    />
  );
}

/* Submit button with loading state */
export function AuthSubmit({ loading, children, loadingText }) {
  return (
    <button
      type="submit"
      className="auth-submit"
      disabled={loading}
      aria-busy={loading ? "true" : "false"}
    >
      {loading && <span className="auth-submit__spinner" aria-hidden="true" />}
      <span>{loading ? loadingText : children}</span>
    </button>
  );
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
