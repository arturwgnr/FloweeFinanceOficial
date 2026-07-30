import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useModal } from '../context/ModalContext';

export default function BudgetScopeModal({ isOpen, onCancel, onSelect, loading }) {
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
        <p className="tx-confirm__title">Save Budget</p>
        <p className="tx-confirm__message">
          Should this budget apply to all months (persistent) or only the current month?
        </p>
        <div className="tx-confirm__actions">
          <button
            type="button"
            disabled={loading}
            onClick={() => onSelect('all')}
            className="btn-secondary flex-1"
          >
            All months
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => onSelect('current')}
            className="btn-primary flex-1"
          >
            This month only
          </button>
        </div>
        <button type="button" disabled={loading} onClick={onCancel} className="budget-scope__cancel">
          Cancel
        </button>
      </div>
    </div>,
    document.body
  );
}
