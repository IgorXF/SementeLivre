'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/hooks/useOrders';
import { StatusPedido, StatusPedidoLabels, TipoPedidoLabels } from '@/types/order';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import styles from './pedidos.module.css';

const statusFilters = [
  { value: 'TODOS', label: 'Todos' },
  ...Object.entries(StatusPedidoLabels).map(([v, l]) => ({ value: v, label: l })),
];

export default function PedidosPage() {
  const { orders, loading } = useOrders();
  const router = useRouter();
  const [filtroStatus, setFiltroStatus] = useState('TODOS');

  const filtered = useMemo(() =>
    orders.filter((o) => filtroStatus === 'TODOS' || o.status === filtroStatus),
    [orders, filtroStatus]
  );

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.filters} role="group" aria-label="Filtrar por status">
          {statusFilters.map((f) => (
            <button key={f.value} className={`${styles.chip} ${filtroStatus === f.value ? styles.chipActive : ''}`} onClick={() => setFiltroStatus(f.value)} aria-pressed={filtroStatus === f.value}>
              {f.label}
            </button>
          ))}
        </div>
        <Link href="/pedidos/novo">
          <Button variant="primary" size="md" aria-label="Novo pedido">+ Novo</Button>
        </Link>
      </div>

      {loading ? (
        <div className={styles.list}>
          {[1, 2, 3].map((i) => <div key={i} className={`skeleton ${styles.skeletonCard}`} />)}
        </div>
      ) : filtered.length === 0 ? (
        orders.length === 0 ? (
          <EmptyState icon="📦" title="Nenhum pedido registrado" description="Registre um pedido de venda, troca ou doação." actionLabel="Registrar Pedido" onAction={() => router.push('/pedidos/novo')} />
        ) : (
          <EmptyState icon="🔍" title="Nenhum pedido com esse status." />
        )
      ) : (
        <ul className={styles.list}>
          {filtered.map((order) => (
            <li key={order.idPedido}>
              <Link href={`/pedidos/${order.idPedido}`} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardId}>#{order.idPedido.slice(-6).toUpperCase()}</span>
                  <Badge variant="orderStatus" value={order.status} />
                </div>
                <p className={styles.cardReceber}>{order.nomeRecebedor}</p>
                <div className={styles.cardFooter}>
                  <Badge variant="orderType" value={order.tipoPedido} />
                  <span className={styles.cardDate}>{order.dataPedido.toLocaleDateString('pt-BR')}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
