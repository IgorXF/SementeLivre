'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Notificacao } from '@/types/notification';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notificacao[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notificacao[]>([]);

  useEffect(() => {
    if (!user) { setNotifications([]); return; }

    const q = query(
      collection(db, 'notificacoes'),
      where('idProprietario', '==', user.uid),
      orderBy('dataGeracao', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => {
        const raw = d.data();
        return {
          ...raw,
          idNotificacao: d.id,
          dataGeracao: raw.dataGeracao?.toDate?.() ?? new Date(),
          dataLeitura: raw.dataLeitura?.toDate?.() ?? undefined,
        } as Notificacao;
      });
      setNotifications(data);
    }, () => {});

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (id: string) => {
    await updateDoc(doc(db, 'notificacoes', id), {
      lida: true,
      dataLeitura: new Date(),
    });
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.lida);
    if (!unread.length) return;
    const batch = writeBatch(db);
    unread.forEach((n) => {
      batch.update(doc(db, 'notificacoes', n.idNotificacao), {
        lida: true,
        dataLeitura: new Date(),
      });
    });
    await batch.commit();
  };

  const unreadCount = notifications.filter((n) => !n.lida).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
