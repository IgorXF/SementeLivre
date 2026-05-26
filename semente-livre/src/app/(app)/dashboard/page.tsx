'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSeeds } from '@/hooks/useSeeds';
import { useOrders } from '@/hooks/useOrders';
import { useProperties } from '@/hooks/useProperties';
import { useNotifications } from '@/context/NotificationContext';
import { DisponibilidadeProduto } from '@/types/stock';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import styles from './dashboard.module.css';

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number | string; color?: string }) {
  return (
    <div className={styles.statCard} aria-label={`${label}: ${value}`}>
      <span className={styles.statIcon} aria-hidden="true">{icon}</span>
      <span className={styles.statValue} style={color ? { color } : undefined}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

export default function DashboardPage() {
  const { proprietario } = useAuth();
  const { seeds, loading: loadingSeeds } = useSeeds();
  const { orders, loading: loadingOrders } = useOrders();
  const { properties } = useProperties();
  const { unreadCount } = useNotifications();
  const router = useRouter();

  const firstName = proprietario?.nome?.split(' ')[0] || 'Produtor';

  // Orders this month
  const now = new Date();
  const ordersThisMonth = orders.filter((o) => {
    const d = o.dataPedido;
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Low stock (available seeds with qty <= 5)
  const lowStock = seeds.filter((s) =>
    s.disponibilidade !== DisponibilidadeProduto.INDISPONIVEL && s.quantidade <= 5
  );

  return (
    <div className={styles.page}>
      <div className={styles.greeting}>
        <p className={styles.greetingText}>Olá, <strong>{firstName}!</strong> 👋</p>
        <p className={styles.greetingDate}>{now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      <section aria-label="Resumo" className={styles.statsGrid}>
        {loadingSeeds ? (
          <>
            <div className={`${styles.statCard} skeleton`} style={{ height: 100 }} />
            <div className={`${styles.statCard} skeleton`} style={{ height: 100 }} />
            <div className={`${styles.statCard} skeleton`} style={{ height: 100 }} />
            <div className={`${styles.statCard} skeleton`} style={{ height: 100 }} />
          </>
        ) : (
          <>
            <StatCard icon="🌱" label="Sementes" value={seeds.length} color="var(--color-primary)" />
            <StatCard icon="📦" label="Pedidos mês" value={ordersThisMonth} color="var(--color-info)" />
            <StatCard icon="🏡" label="Propriedades" value={properties.length} color="#7c3aed" />
            <StatCard icon="🔔" label="Notif. novas" value={unreadCount} color="var(--color-danger)" />
          </>
        )}
      </section>

      {lowStock.length > 0 && (
        <section className={styles.alertSection} aria-label="Sementes com baixo estoque">
          <h2 className={styles.sectionTitle}>⚠ Estoque baixo</h2>
          <div className={styles.alertList}>
            {lowStock.map((s) => (
              <Link key={s.idEstoque} href={`/sementes/${s.idEstoque}`} className={styles.alertCard}>
                <span className={styles.alertEmoji}>🌱</span>
                <div>
                  <p className={styles.alertName}>{s.nomePopular}</p>
                  <p className={styles.alertQty}>{s.quantidade} {s.tipoPesagem}</p>
                </div>
                <Badge variant="availability" value={s.disponibilidade} />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section aria-label="Atalhos rápidos" className={styles.shortcuts}>
        <h2 className={styles.sectionTitle}>Ações rápidas</h2>
        <div className={styles.shortcutGrid}>
          <Button variant="primary" size="lg" fullWidth onClick={() => router.push('/sementes/nova')}>
            🌱 Nova Semente
          </Button>
          <Button variant="secondary" size="lg" fullWidth onClick={() => router.push('/pedidos/novo')}>
            📦 Novo Pedido
          </Button>
        </div>
      </section>
    </div>
  );
}
