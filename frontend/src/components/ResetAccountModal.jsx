import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CircleAlert, RotateCcw, TriangleAlert, X } from "lucide-react";
import { useModal } from "../context/ModalContext";

const CONFIRM_WORD = "RESET";

export default function ResetAccountModal({ isOpen, onCancel, onConfirm, loading, error }) {
  const { pushModal, popModal } = useModal();
  const [password, setPassword] = useState("");
  const [phrase, setPhrase] = useState("");
  const passwordRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    pushModal();
    setPassword("");
    setPhrase("");
    const t = setTimeout(() => passwordRef.current?.focus(), 0);
    function onKey(e) {
      if (e.key === "Escape" && !loading) onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      popModal();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const canSubmit = password.length > 0 && phrase === CONFIRM_WORD && !loading;

  function handleSubmit(e) {
    e.preventDefault();
    if (canSubmit) onConfirm(password);
  }

  return createPortal(
    <div className="reset-modal__overlay" onMouseDown={() => !loading && onCancel()}>
      <div
        className="reset-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-modal-title"
        aria-describedby="reset-modal-desc"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="reset-modal__close"
          onClick={onCancel}
          disabled={loading}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="reset-modal__icon" aria-hidden="true">
          <TriangleAlert size={22} />
        </div>

        <h2 id="reset-modal-title" className="reset-modal__title">
          Reset your account?
        </h2>
        <p id="reset-modal-desc" className="reset-modal__text">
          This permanently deletes all of your transactions, budgets, goals, custom
          categories and saved insights. It cannot be undone.
        </p>

        <form className="reset-modal__form" onSubmit={handleSubmit}>
          <div className="reset-modal__field">
            <label className="label" htmlFor="reset-password">
              Confirm with your password
            </label>
            <input
              ref={passwordRef}
              id="reset-password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <div className="reset-modal__field">
            <label className="label" htmlFor="reset-phrase">
              Type <span className="reset-modal__code">{CONFIRM_WORD}</span> to confirm
            </label>
            <input
              id="reset-phrase"
              type="text"
              className="input"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value.toUpperCase())}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck="false"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="reset-modal__error" role="alert">
              <CircleAlert size={14} aria-hidden="true" />
              {error}
            </p>
          )}

          <div className="reset-modal__actions">
            <button
              type="button"
              className="btn-secondary reset-modal__btn"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-danger reset-modal__btn"
              disabled={!canSubmit}
            >
              <RotateCcw size={16} aria-hidden="true" />
              {loading ? "Resetting…" : "Reset account"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
