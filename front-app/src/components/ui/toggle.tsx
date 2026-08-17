'use client';

import React from 'react';
import clsx from 'clsx';
import styles from './toggle.module.css';

interface ToggleProps {
  options: { value: string; label: string; variant?: 'primary' | 'danger' }[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function Toggle({ options, value, onChange, label }: ToggleProps) {
  return (
    <div className={styles.wrapper}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.group} role="radiogroup" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            className={clsx(
              styles.option,
              value === opt.value && styles.active,
              value === opt.value && opt.variant === 'danger' && styles.activeDanger
            )}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
