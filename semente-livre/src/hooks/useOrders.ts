'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  collection, onSnapshot, query, where, orderBy,
  doc, addDoc, updateDoc, deleteDoc, getDoc, Timestamp, setDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Pedido, StatusPedido } from '@/types/order';
import { useAuth } from '@/context/AuthContext';

function toDate(val: unknown): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof (val as Timestamp).toDate === 'function') return (val as Timestamp).toDate();
  return new Date(val as string);
}

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setOrders([]); setLoading(false); return; }
    const q = query(
      collection(db, 'pedidos'),
      where('idProprietario', '==', user.uid),
      orderBy('dataPedido', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => {
        const data = d.data();
        return { ...data, idPedido: d.id, dataPedido: toDate(data.dataPedido) } as Pedido;
      }));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [user]);

  const createOrder = useCallback(async (data: Omit<Pedido, 'idPedido'>) => {
    const docRef = await addDoc(collection(db, 'pedidos'), { ...data, dataPedido: new Date() });
    // Create notification
    await addDoc(collection(db, 'notificacoes'), {
      idProprietario: data.idProprietario,
      idPedido: docRef.id,
      titulo: 'Novo pedido registrado',
      mensagem: `Pedido de ${data.tipoPedido.toLowerCase()} para ${data.nomeRecebedor} registrado.`,
      lida: false,
      dataGeracao: new Date(),
    });
    return docRef.id;
  }, []);

  const updateOrder = useCallback(async (id: string, data: Partial<Pedido>) => {
    await updateDoc(doc(db, 'pedidos', id), data);
  }, []);

  const cancelOrder = useCallback(async (id: string) => {
    await updateDoc(doc(db, 'pedidos', id), { status: StatusPedido.CANCELADO });
  }, []);

  const confirmOrder = useCallback(async (id: string) => {
    await updateDoc(doc(db, 'pedidos', id), { status: StatusPedido.CONFIRMADO });
  }, []);

  const getOrder = useCallback(async (id: string): Promise<Pedido | null> => {
    const snap = await getDoc(doc(db, 'pedidos', id));
    if (!snap.exists()) return null;
    const data = snap.data();
    return { ...data, idPedido: snap.id, dataPedido: toDate(data.dataPedido) } as Pedido;
  }, []);

  return { orders, loading, createOrder, updateOrder, cancelOrder, confirmOrder, getOrder };
}
