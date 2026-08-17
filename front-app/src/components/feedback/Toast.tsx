'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import styles from './Toast.module.css';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const icons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className={styles.container}
        aria-live="polite"
        aria-atomic="false"
        role="region"
        aria-label="Notificações"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${styles.toast} ${styles[t.type]}`}
            role={t.type === 'error' ? 'alert' : 'status'}
          >
            <span className={styles.icon} aria-hidden="true">{icons[t.type]}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
