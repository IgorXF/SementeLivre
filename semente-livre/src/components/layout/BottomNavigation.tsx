'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './BottomNavigation.module.css';

const navItems = [
  { href: '/dashboard', label: 'Início', icon: '🏠' },
  { href: '/sementes', label: 'Sementes', icon: '🌱' },
  { href: '/pedidos', label: 'Pedidos', icon: '📦' },
  { href: '/propriedades', label: 'Propriedades', icon: '🏡' },
  { href: '/perfil', label: 'Perfil', icon: '👤' },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Navegação principal">
      <div className={styles.inner} role="tablist">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.item} ${isActive ? styles.active : ''}`}
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={styles.icon} aria-hidden="true">{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
              {isActive && <span className={styles.indicator} aria-hidden="true" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
