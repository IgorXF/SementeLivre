'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  collection, onSnapshot, query, where, orderBy,
  doc, addDoc, updateDoc, deleteDoc, getDoc, Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Estoque, TipoMovimentacao, DisponibilidadeProduto } from '@/types/stock';
import { useAuth } from '@/context/AuthContext';

function toDate(val: unknown): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof (val as Timestamp).toDate === 'function') return (val as Timestamp).toDate();
  return new Date(val as string);
}

export function useSeeds() {
  const { user } = useAuth();
  const [seeds, setSeeds] = useState<Estoque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setSeeds([]); setLoading(false); return; }
    const q = query(
      collection(db, 'estoques'),
      where('idProprietario', '==', user.uid),
      orderBy('dataMovimentacao', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setSeeds(snap.docs.map((d) => {
        const data = d.data();
        return {
          ...data, idEstoque: d.id,
          dataMovimentacao: toDate(data.dataMovimentacao),
          dataUltimaAtualizacaoEstoque: toDate(data.dataUltimaAtualizacaoEstoque),
        } as Estoque;
      }));
      setLoading(false);
    }, (err) => { setError(err.message); setLoading(false); });
    return () => unsub();
  }, [user]);

  const createSeed = useCallback(async (data: Omit<Estoque, 'idEstoque'>) => {
    const docRef = await addDoc(collection(db, 'estoques'), {
      ...data, dataMovimentacao: new Date(), dataUltimaAtualizacaoEstoque: new Date(),
    });
    return docRef.id;
  }, []);

  const updateSeed = useCallback(async (id: string, data: Partial<Estoque>) => {
    await updateDoc(doc(db, 'estoques', id), { ...data, dataUltimaAtualizacaoEstoque: new Date() });
  }, []);

  const deleteSeed = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'estoques', id));
  }, []);

  const uploadSeedPhoto = useCallback(async (file: File, seedId: string): Promise<string> => {
    const storageRef = ref(storage, `sementes/${seedId}/${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }, []);

  const getSeed = useCallback(async (id: string): Promise<Estoque | null> => {
    const snap = await getDoc(doc(db, 'estoques', id));
    if (!snap.exists()) return null;
    const data = snap.data();
    return { ...data, idEstoque: snap.id, dataMovimentacao: toDate(data.dataMovimentacao), dataUltimaAtualizacaoEstoque: toDate(data.dataUltimaAtualizacaoEstoque) } as Estoque;
  }, []);

  return { seeds, loading, error, createSeed, updateSeed, deleteSeed, uploadSeedPhoto, getSeed };
}
