'use client';

import { useEffect, useState, useCallback } from 'react';
import { dbOnSnapshot, dbAdd, dbUpdate, dbDelete, dbGet } from '@/lib/db';
import { mockSementes } from '@/data/mockSementes';
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
      setSeeds([...mockSementes]);
      setLoading(false);
      return;
    }

    const unsubscribe = dbOnSnapshot<EstoqueRow>(
      'estoques',
      (row) => row.idProprietario === user.uid,
      (rows) => {
        // Remove from 'rows' any items that are actually mock items to avoid duplicates
        const realRows = rows.filter(r => !mockSementes.some(m => m.idEstoque === r.id));
        
        // If a mock item was edited and saved in DB, merge its DB changes with the original mock item (which has the new photos)
        const mergedMocks = mockSementes.map(mock => {
          const savedInDb = rows.find(r => r.id === mock.idEstoque);
          if (savedInDb) {
            return { ...mock, ...rowToEstoque(savedInDb as EstoqueRow), urlFoto: mock.urlFoto };
          }
          return mock;
        });

        const sorted = [...realRows.map(rowToEstoque), ...mergedMocks].sort(
          (a, b) => b.dataMovimentacao.getTime() - a.dataMovimentacao.getTime()
        );
        setSeeds(sorted);
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
    const mock = mockSementes.find(m => m.idEstoque === id);
    const row = dbGet<EstoqueRow>('estoques', id);
    
    if (mock) {
      if (row) return { ...mock, ...rowToEstoque(row), urlFoto: mock.urlFoto };
      return mock;
    }
    
    if (!row) return null;
    return rowToEstoque(row);
  }, []);

  return { seeds, loading, error, createSeed, updateSeed, deleteSeed, uploadSeedPhoto, getSeed };
}
