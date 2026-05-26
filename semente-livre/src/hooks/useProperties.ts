'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  collection, onSnapshot, query, where, orderBy,
  doc, addDoc, updateDoc, deleteDoc, getDoc, Timestamp, getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Propriedade, Comunidade, StatusComunidade } from '@/types/property';
import { useAuth } from '@/context/AuthContext';

function toDate(val: unknown): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof (val as Timestamp).toDate === 'function') return (val as Timestamp).toDate();
  return new Date(val as string);
}

export function useProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Propriedade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setProperties([]); setLoading(false); return; }
    const q = query(
      collection(db, 'propriedades'),
      where('idProprietario', '==', user.uid),
      orderBy('dataCadastro', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setProperties(snap.docs.map((d) => {
        const data = d.data();
        return { ...data, idPropriedade: d.id, dataCadastro: toDate(data.dataCadastro), dataUltimaAlteracao: toDate(data.dataUltimaAlteracao) } as Propriedade;
      }));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [user]);

  const createProperty = useCallback(async (data: Omit<Propriedade, 'idPropriedade'>) => {
    const docRef = await addDoc(collection(db, 'propriedades'), { ...data, dataCadastro: new Date(), dataUltimaAlteracao: new Date() });
    return docRef.id;
  }, []);

  const updateProperty = useCallback(async (id: string, data: Partial<Propriedade>) => {
    await updateDoc(doc(db, 'propriedades', id), { ...data, dataUltimaAlteracao: new Date() });
  }, []);

  const deleteProperty = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'propriedades', id));
  }, []);

  return { properties, loading, createProperty, updateProperty, deleteProperty };
}

export function useCommunities() {
  const [communities, setCommunities] = useState<Comunidade[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'comunidades'), where('status', '==', StatusComunidade.ATIVA));
    const unsub = onSnapshot(q, (snap) => {
      setCommunities(snap.docs.map((d) => {
        const data = d.data();
        return { ...data, idComunidade: d.id, dataSolicitacao: toDate(data.dataSolicitacao) } as Comunidade;
      }));
    }, () => {});
    return () => unsub();
  }, []);

  const requestCommunity = useCallback(async (nome: string, municipio: string, uf: string) => {
    const docRef = await addDoc(collection(db, 'comunidades'), {
      nome, municipio, uf,
      status: StatusComunidade.PENDENTE_APROVACAO,
      dataSolicitacao: new Date(),
    });
    return docRef.id;
  }, []);

  return { communities, requestCommunity };
}
