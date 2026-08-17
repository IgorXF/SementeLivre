'use client';

import { useEffect, useState, useCallback } from 'react';
import { dbOnSnapshot, dbAdd, dbUpdate, dbDelete } from '@/lib/db';
import { Propriedade, Comunidade, StatusComunidade } from '@/types/property';
import { useAuth } from '@/context/AuthContext';

type PropriedadeRow = Propriedade & { id: string };
type ComunidadeRow = Comunidade & { id: string };

function rowToPropriedade(row: PropriedadeRow): Propriedade {
  return {
    ...row,
    idPropriedade: row.id,
    dataCadastro: row.dataCadastro ? new Date(row.dataCadastro) : new Date(),
    dataUltimaAlteracao: row.dataUltimaAlteracao
      ? new Date(row.dataUltimaAlteracao)
      : new Date(),
  };
}

export function useProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Propriedade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProperties([]);
      setLoading(false);
      return;
    }

    const unsubscribe = dbOnSnapshot<PropriedadeRow>(
      'propriedades',
      (row) => row.idProprietario === user.uid,
      (rows) => {
        const sorted = [...rows].sort(
          (a, b) =>
            new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime()
        );
        setProperties(sorted.map(rowToPropriedade));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const createProperty = useCallback(
    async (data: Omit<Propriedade, 'idPropriedade'>): Promise<string> => {
      const row = dbAdd<PropriedadeRow>('propriedades', {
        ...data,
        dataCadastro: new Date(),
        dataUltimaAlteracao: new Date(),
      } as Omit<PropriedadeRow, 'id'>);
      return row.id;
    },
    []
  );

  const updateProperty = useCallback(
    async (id: string, data: Partial<Propriedade>) => {
      dbUpdate<PropriedadeRow>('propriedades', id, {
        ...data,
        dataUltimaAlteracao: new Date(),
      } as Partial<PropriedadeRow>);
    },
    []
  );

  const deleteProperty = useCallback(async (id: string) => {
    dbDelete('propriedades', id);
  }, []);

  return { properties, loading, createProperty, updateProperty, deleteProperty };
}

export function useCommunities() {
  const [communities, setCommunities] = useState<Comunidade[]>([]);

  useEffect(() => {
    const unsubscribe = dbOnSnapshot<ComunidadeRow>(
      'comunidades',
      (row) => row.status === StatusComunidade.ATIVA,
      (rows) => {
        setCommunities(
          rows.map((r) => ({
            ...r,
            idComunidade: r.id,
            dataSolicitacao: r.dataSolicitacao ? new Date(r.dataSolicitacao) : new Date(),
          }))
        );
      }
    );

    return () => unsubscribe();
  }, []);

  const requestCommunity = useCallback(
    async (nome: string, municipio: string, uf: string): Promise<string> => {
      const row = dbAdd<ComunidadeRow>('comunidades', {
        nome,
        municipio,
        uf,
        status: StatusComunidade.PENDENTE_APROVACAO,
        dataSolicitacao: new Date(),
      } as Omit<ComunidadeRow, 'id'>);
      return row.id;
    },
    []
  );

  return { communities, requestCommunity };
}
