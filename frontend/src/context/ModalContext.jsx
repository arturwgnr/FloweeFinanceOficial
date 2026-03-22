import React, { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [openCount, setOpenCount] = useState(0);

  const pushModal = useCallback(() => setOpenCount((n) => n + 1), []);
  const popModal = useCallback(() => setOpenCount((n) => Math.max(0, n - 1)), []);

  return (
    <ModalContext.Provider value={{ pushModal, popModal, isAnyModalOpen: openCount > 0 }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
