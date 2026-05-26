'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrders } from '@/hooks/useOrders';
import { useToast } from '@/components/feedback/Toast';
import { Pedido, StatusPedido, TipoPedidoLabels } from '@/types/order';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/feedback/EmptyState';
import styles from './pedido.module.css';

export default function PedidoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getOrder, cancelOrder, confirmOrder } = useOrders();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    getOrder(id).then((o) => { setOrder(o); setLoading(false); });
  }, [id, getOrder]);

  if (loading) return <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />;
  if (!order) return <EmptyState icon="📦" title="Pedido não encontrado" actionLabel="Voltar" onAction={() => router.push('/pedidos')} />;

  const handleCancel = async () => {
    setActing(true);
    try {
      await cancelOrder(id);
      setOrder((p) => p ? { ...p, status: StatusPedido.CANCELADO } : p);
      showToast('Pedido cancelado.', 'success');
      setShowCancel(false);
    } catch { showToast('Erro ao cancelar.', 'error'); }
    finally { setActing(false); }
  };

  const handleConfirm = async () => {
    setActing(true);
    try {
      await confirmOrder(id);
      setOrder((p) => p ? { ...p, status: StatusPedido.CONFIRMADO } : p);
      showToast('Pedido confirmado!', 'success');
    } catch { showToast('Erro ao confirmar.', 'error'); }
    finally { setActing(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.id}>#{order.idPedido.slice(-6).toUpperCase()}</span>
          <Badge variant="orderStatus" value={order.status} />
        </div>
        <div className={styles.row}><span className={styles.label}>Tipo:</span><Badge variant="orderType" value={order.tipoPedido} /></div>
        <div className={styles.row}><span className={styles.label}>Data:</span><span>{order.dataPedido.toLocaleDateString('pt-BR', { dateStyle: 'long' })}</span></div>
        <div className={styles.row}><span className={styles.label}>Recebedor:</span><span className={styles.value}>{order.nomeRecebedor}</span></div>
        {order.contatoRecebedor && <div className={styles.row}><span className={styles.label}>Contato:</span><span>{order.contatoRecebedor}</span></div>}
      </div>

      <div className={styles.card}>
        <p className={styles.sectionTitle}>Itens do Pedido</p>
        <ul className={styles.itensList}>
          {order.itens.map((item) => (
            <li key={item.idItem} className={styles.item}>
              <span className={styles.itemName}>{item.nomePopular}</span>
              <span className={styles.itemQty}>{item.quantidade} {item.tipoPesagem}</span>
              {item.precoUnitario && <span className={styles.itemPrice}>R$ {(item.precoUnitario * item.quantidade).toFixed(2)}</span>}
            </li>
          ))}
        </ul>
        {order.totalValor && (
          <p className={styles.total}>Total: <strong>R$ {order.totalValor.toFixed(2)}</strong></p>
        )}
      </div>

      {order.mensagemOpcional && (
        <div className={styles.card}>
          <p className={styles.sectionTitle}>Observações</p>
          <p className={styles.obs}>{order.mensagemOpcional}</p>
        </div>
      )}

      {order.status === StatusPedido.PENDENTE && (
        <div className={styles.actions}>
          <Button variant="ghost" fullWidth onClick={() => setShowCancel(true)}>Cancelar Pedido</Button>
          <Button variant="primary" fullWidth onClick={handleConfirm} loading={acting}>Confirmar Pedido</Button>
        </div>
      )}

      <ConfirmDialog
        isOpen={showCancel}
        title="Cancelar Pedido"
        description="O estoque das sementes será restaurado. Confirmar cancelamento?"
        confirmLabel="Cancelar Pedido"
        confirmVariant="danger"
        onConfirm={handleCancel}
        onCancel={() => setShowCancel(false)}
        loading={acting}
      />
    </div>
  );
}
