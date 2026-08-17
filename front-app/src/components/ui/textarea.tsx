'use client';

import React, { useId } from 'react';
import clsx from 'clsx';
import styles from './input.module.css';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, required, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && <span className={styles.required} aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={clsx(styles.input, error && styles.error, className)}
          style={{ resize: 'vertical', minHeight: 100 }}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          required={required}
          {...props}
        />
        {hint && !error && <span className={styles.hint}>{hint}</span>}
        {error && (
          <span id={errorId} className={styles.errorMessage} role="alert">
            ⚠ {error}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
