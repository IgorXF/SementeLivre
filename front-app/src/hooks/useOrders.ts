'use client';

import { useEffect, useState, useCallback } from 'react';
import { dbOnSnapshot, dbAdd, dbUpdate, dbGet } from '@/lib/db';
import { mockPedidos } from '@/data/mockPedidos';
import { Pedido, StatusPedido } from '@/types/order';
import { useAuth } from '@/context/AuthContext';

type PedidoRow = Pedido & { id: string };

function rowToPedido(row: PedidoRow): Pedido {
  return {
    ...row,
    idPedido: row.id,
    dataPedido: row.dataPedido ? new Date(row.dataPedido) : new Date(),
  };
}

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setOrders([...mockPedidos]);
      setLoading(false);
      return;
    }

    const unsubscribe = dbOnSnapshot<PedidoRow>(
      'pedidos',
      (row) => row.idProprietario === user.uid,
      (rows) => {
        const sorted = [...rows.map(rowToPedido), ...mockPedidos].sort(
          (a, b) => b.dataPedido.getTime() - a.dataPedido.getTime()
        );
        setOrders(sorted);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const createOrder = useCallback(
    async (data: Omit<Pedido, 'idPedido'>): Promise<string> => {
      const row = dbAdd<PedidoRow>('pedidos', {
        ...data,
        dataPedido: new Date(),
      } as Omit<PedidoRow, 'id'>);

      // Create notification
      dbAdd('notificacoes', {
        idProprietario: data.idProprietario,
        idPedido: row.id,
        titulo: 'Novo pedido registrado',
        mensagem: `Pedido de ${data.tipoPedido.toLowerCase()} para ${data.nomeRecebedor} registrado.`,
        lida: false,
        dataGeracao: new Date(),
      });

      return row.id;
    },
    []
  );

  const updateOrder = useCallback(async (id: string, data: Partial<Pedido>) => {
    dbUpdate<PedidoRow>('pedidos', id, data as Partial<PedidoRow>);
  }, []);

  const cancelOrder = useCallback(async (id: string) => {
    dbUpdate<PedidoRow>('pedidos', id, { status: StatusPedido.CANCELADO } as Partial<PedidoRow>);
  }, []);

  const confirmOrder = useCallback(async (id: string) => {
    dbUpdate<PedidoRow>('pedidos', id, { status: StatusPedido.CONFIRMADO } as Partial<PedidoRow>);
  }, []);

  const getOrder = useCallback(async (id: string): Promise<Pedido | null> => {
    const mock = mockPedidos.find(m => m.idPedido === id);
    if (mock) return mock;
    
    const row = dbGet<PedidoRow>('pedidos', id);
    if (!row) return null;
    return rowToPedido(row);
  }, []);

  return { orders, loading, createOrder, updateOrder, cancelOrder, confirmOrder, getOrder };
}
