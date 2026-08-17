'use client';

import React from 'react';
import clsx from 'clsx';
import styles from './button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const isDark = variant === 'ghost' || variant === 'text' || variant === 'secondary';

  return (
    <button
      className={clsx(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <>
          <span
            className={clsx(styles.spinner, isDark && styles.spinnerDark)}
            aria-hidden="true"
          />
          <span className="sr-only">Carregando...</span>
        </>
      )}
      {!loading && children}
    </button>
  );
}
