import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Lock, Mail, User } from "lucide-react";
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
import "../styles/pages/Register.css";

const MIN_PASSWORD = 6;

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Enter your name.";
  if (!form.email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(form.email.trim()))
    errors.email = "Enter a valid email, like name@example.com.";
  if (!form.password) errors.password = "Choose a password.";
  else if (form.password.length < MIN_PASSWORD)
    errors.password = `Password must be at least ${MIN_PASSWORD} characters.`;
  return errors;
}

const FIELD_ORDER = ["name", "email", "password"];

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [emailTaken, setEmailTaken] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const errors = validate(form);
  const fieldError = (name) =>
    (touched[name] || submitted) && errors[name] ? errors[name] : "";

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (serverError) {
      setServerError("");
      setEmailTaken(false);
    }
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
    setEmailTaken(false);
    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      login(res.data.token, res.data.user);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      const taken = err.response?.status === 409;
      setEmailTaken(taken);
      setServerError(
        taken
          ? "An account with this email already exists."
          : err.response?.data?.error || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const passwordMet = form.password.length >= MIN_PASSWORD;

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free to use. Takes less than a minute."
      panelTitle="See where your money flows, starting today."
      panelText="Log your first transaction and your dashboard, budgets and goals start filling in."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="auth__link">
            Sign in
          </Link>
        </>
      }
    >
      <AuthAlert>
        {serverError && (
          <>
            {serverError}
            {emailTaken && (
              <>
                {" "}
                <Link to="/login" className="auth__link">
                  Sign in instead
                </Link>
              </>
            )}
          </>
        )}
      </AuthAlert>

      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        <AuthField
          id="name"
          name="name"
          label="Full name"
          icon={User}
          value={form.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Your name"
          autoComplete="name"
          required
          error={fieldError("name")}
        />
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
          placeholder="Create a password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD}
          hint={`At least ${MIN_PASSWORD} characters`}
          hintMet={passwordMet}
          error={fieldError("password")}
        />
        <AuthSubmit loading={loading} loadingText="Creating account…">
          Create account
        </AuthSubmit>
      </form>
    </AuthShell>
  );
}
