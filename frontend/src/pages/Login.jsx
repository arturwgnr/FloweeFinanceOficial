import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Lock, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  AuthAlert,
  AuthField,
  AuthShell,
  AuthSubmit,
  EMAIL_RE,
  PasswordField,
} from "../components/AuthShell";
import "../styles/pages/Login.css";

function validate(form) {
  const errors = {};
  if (!form.email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(form.email.trim()))
    errors.email = "Enter a valid email, like name@example.com.";
  if (!form.password) errors.password = "Enter your password.";
  return errors;
}

const FIELD_ORDER = ["email", "password"];

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const errors = validate(form);
  const fieldError = (name) =>
    (touched[name] || submitted) && errors[name] ? errors[name] : "";

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (serverError) setServerError("");
  }

  function handleBlur(e) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    const firstInvalid = FIELD_ORDER.find((f) => errors[f]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }
    setServerError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.token, res.data.user);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.error;
      setServerError(
        msg === "Invalid credentials"
          ? "That email and password don't match. Check them and try again."
          : msg || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to pick up where your month left off."
      panelTitle="Your money, exactly where you left it."
      panelText="Budgets, goals and this month's numbers are waiting on your dashboard."
      footer={
        <>
          New to Flowee?{" "}
          <Link to="/register" className="auth__link">
            Create an account
          </Link>
        </>
      }
    >
      <AuthAlert>{serverError}</AuthAlert>

      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        <AuthField
          id="email"
          name="email"
          type="email"
          label="Email"
          icon={Mail}
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck="false"
          required
          error={fieldError("email")}
        />
        <PasswordField
          id="password"
          name="password"
          label="Password"
          icon={Lock}
          value={form.password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Your password"
          autoComplete="current-password"
          required
          error={fieldError("password")}
        />
        <AuthSubmit loading={loading} loadingText="Signing in…">
          Sign in
        </AuthSubmit>
      </form>
    </AuthShell>
  );
}
