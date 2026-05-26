'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';
import { useNotifications } from '@/context/NotificationContext';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  actions?: React.ReactNode;
  showNotifications?: boolean;
}

export function Header({ title, showBack = false, actions, showNotifications = false }: HeaderProps) {
  const router = useRouter();
  const { unreadCount } = useNotifications();

  return (
    <header className={styles.header} role="banner">
      <div className={styles.inner}>
        <div className={styles.left}>
          {showBack && (
            <button
              type="button"
              onClick={() => router.back()}
              className={styles.backBtn}
              aria-label="Voltar"
            >
              ←
            </button>
          )}
          <h1 className={styles.title}>{title}</h1>
        </div>
        <div className={styles.right}>
          {actions}
          {showNotifications && (
            <Link href="/notificacoes" className={styles.notifBtn} aria-label={`Notificações${unreadCount > 0 ? `, ${unreadCount} não lidas` : ''}`}>
              🔔
              {unreadCount > 0 && (
                <span className={styles.badge} aria-hidden="true">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
