'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  onAuthStateChanged,
  signOutAndNotify,
  Session,
} from '@/lib/auth';
import { dbGet } from '@/lib/db';
import { Proprietario } from '@/types/user';

interface AuthContextType {
  user: Session | null;
  proprietario: Proprietario | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  proprietario: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Session | null>(null);
  const [proprietario, setProprietario] = useState<Proprietario | null>(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      signOutAndNotify();
    }, 30 * 60 * 1000); // 30 min
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (session) => {
      setUser(session);
      if (session) {
        try {
          const prop = dbGet<Proprietario & { id: string }>('proprietarios', session.uid);
          if (prop) {
            setProprietario({ ...prop, idProprietario: prop.id });
          } else {
            setProprietario(null);
          }
        } catch {
          setProprietario(null);
        }
        resetTimer();
      } else {
        setProprietario(null);
      }
      setLoading(false);
    });

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((e) => document.addEventListener(e, resetTimer));

    return () => {
      unsubscribe();
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach((e) => document.removeEventListener(e, resetTimer));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    signOutAndNotify();
  };

  return (
    <AuthContext.Provider value={{ user, proprietario, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
