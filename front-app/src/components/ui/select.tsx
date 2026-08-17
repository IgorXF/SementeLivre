'use client';

import React, { useId } from 'react';
import clsx from 'clsx';
import styles from './select.module.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, required, className, id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;

    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={selectId} className={styles.label}>
            {label}
            {required && <span className={styles.required} aria-hidden="true">*</span>}
          </label>
        )}
        <div className={styles.selectWrapper}>
          <select
            ref={ref}
            id={selectId}
            className={clsx(styles.select, error && styles.error, className)}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? errorId : undefined}
            required={required}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className={styles.chevron} aria-hidden="true">▾</span>
        </div>
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

Select.displayName = 'Select';
