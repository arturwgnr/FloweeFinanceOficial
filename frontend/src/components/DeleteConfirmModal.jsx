import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useModal } from "../context/ModalContext";

export default function DeleteConfirmModal({ isOpen, onCancel, onConfirm, loading }) {
  const { pushModal, popModal } = useModal();

  useEffect(() => {
    if (isOpen) {
      pushModal();
      return () => popModal();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="tx-confirm__overlay">
      <div className="tx-confirm__box">
        <p className="tx-confirm__title">Delete Transaction</p>
        <p className="tx-confirm__message">
          Are you sure you want to delete this transaction? This action cannot be undone.
        </p>
        <div className="tx-confirm__actions">
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="btn-danger flex-1"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
