'use client';

import { useEffect, useState, useCallback } from 'react';
import { dbOnSnapshot, dbAdd, dbUpdate, dbDelete, dbGet } from '@/lib/db';
import { uploadFile, getDownloadURL } from '@/lib/storage';
import { Estoque } from '@/types/stock';
import { useAuth } from '@/context/AuthContext';

type EstoqueRow = Estoque & { id: string };

function rowToEstoque(row: EstoqueRow): Estoque {
  return {
    ...row,
    idEstoque: row.id,
    dataMovimentacao: row.dataMovimentacao ? new Date(row.dataMovimentacao) : new Date(),
    dataUltimaAtualizacaoEstoque: row.dataUltimaAtualizacaoEstoque
      ? new Date(row.dataUltimaAtualizacaoEstoque)
      : new Date(),
  };
}

export function useSeeds() {
  const { user } = useAuth();
  const [seeds, setSeeds] = useState<Estoque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSeeds([]);
      setLoading(false);
      return;
    }

    const unsubscribe = dbOnSnapshot<EstoqueRow>(
      'estoques',
      (row) => row.idProprietario === user.uid,
      (rows) => {
        const sorted = [...rows].sort(
          (a, b) =>
            new Date(b.dataMovimentacao).getTime() - new Date(a.dataMovimentacao).getTime()
        );
        setSeeds(sorted.map(rowToEstoque));
        setLoading(false);
        setError(null);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const createSeed = useCallback(
    async (data: Omit<Estoque, 'idEstoque'>): Promise<string> => {
      const row = dbAdd<EstoqueRow>('estoques', {
        ...data,
        dataMovimentacao: new Date(),
        dataUltimaAtualizacaoEstoque: new Date(),
      } as Omit<EstoqueRow, 'id'>);
      return row.id;
    },
    []
  );

  const updateSeed = useCallback(async (id: string, data: Partial<Estoque>) => {
    dbUpdate<EstoqueRow>('estoques', id, {
      ...data,
      dataUltimaAtualizacaoEstoque: new Date(),
    } as Partial<EstoqueRow>);
  }, []);

  const deleteSeed = useCallback(async (id: string) => {
    dbDelete('estoques', id);
  }, []);

  const uploadSeedPhoto = useCallback(
    async (file: File, seedId: string): Promise<string> => {
      const path = `sementes/${seedId}/${file.name}`;
      return uploadFile(path, file);
    },
    []
  );

  const getSeed = useCallback(async (id: string): Promise<Estoque | null> => {
    const row = dbGet<EstoqueRow>('estoques', id);
    if (!row) return null;
    return rowToEstoque(row);
  }, []);

  return { seeds, loading, error, createSeed, updateSeed, deleteSeed, uploadSeedPhoto, getSeed };
}
