'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { dbOnSnapshot, dbUpdate } from '@/lib/db';
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

type NotificacaoRow = Notificacao & { id: string };

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notificacao[]>([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const unsubscribe = dbOnSnapshot<NotificacaoRow>(
      'notificacoes',
      (row) => row.idProprietario === user.uid,
      (rows) => {
        const sorted = [...rows].sort(
          (a, b) =>
            new Date(b.dataGeracao).getTime() - new Date(a.dataGeracao).getTime()
        );
        setNotifications(sorted.map((r) => ({ ...r, idNotificacao: r.id })));
      }
    );

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (id: string) => {
    dbUpdate<NotificacaoRow>('notificacoes', id, {
      lida: true,
      dataLeitura: new Date(),
    } as Partial<NotificacaoRow>);
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.lida);
    unread.forEach((n) => {
      dbUpdate<NotificacaoRow>('notificacoes', n.idNotificacao, {
        lida: true,
        dataLeitura: new Date(),
      } as Partial<NotificacaoRow>);
    });
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
