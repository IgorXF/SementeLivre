'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowDown, ArrowUp, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useSeeds } from '@/hooks/useSeeds';
import { MovimentacaoEstoque, TipoMovimentacao, TipoMovimentacaoLabels } from '@/types/stock';
import { dbOnSnapshot } from '@/lib/db';
import { mockMovimentacoes } from '@/data/mockMovimentacoes';
import styles from './movimentacoes.module.css';

export default function MovimentacoesEstoquePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getSeed } = useSeeds();

  const [seedName, setSeedName] = useState<string>('Produto');
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSeed(id).then(s => {
      if (s) setSeedName(s.nomePopular);
    });

    const unsubscribe = dbOnSnapshot<any>(
      'movimentacoes',
      (row) => row.idProduto === id,
      (rows) => {
        const mockMatches = mockMovimentacoes.filter(m => m.idProduto === id);
        
        const combined = [...rows.map(r => ({
          ...r,
          dataMovimentacao: new Date(r.dataMovimentacao)
        })), ...mockMatches];
        
        const sorted = combined.sort((a, b) => b.dataMovimentacao.getTime() - a.dataMovimentacao.getTime());
        setMovimentacoes(sorted);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id, getSeed]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Button variant="ghost" onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={20} />
        </Button>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>Histórico de Estoque</h1>
          <p className={styles.subtitle}>{seedName}</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.list}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 70, borderRadius: 12 }} />)}
        </div>
      ) : movimentacoes.length === 0 ? (
        <EmptyState
          icon={<History size={38} strokeWidth={1.5} />}
          title="Sem movimentações"
          description="Ainda não há registros de entrada ou saída para este produto."
        />
      ) : (
        <ul className={styles.list}>
          {movimentacoes.map((mov) => {
            const isPos = mov.delta > 0;
            return (
              <li key={mov.id} className={styles.card}>
                <div className={`${styles.iconWrap} ${isPos ? styles.iconPos : styles.iconNeg}`}>
                  {isPos ? <ArrowUp size={16} strokeWidth={2.5} /> : <ArrowDown size={16} strokeWidth={2.5} />}
                </div>
                <div className={styles.info}>
                  <p className={styles.type}>{TipoMovimentacaoLabels[mov.tipo]}</p>
                  <p className={styles.date}>{mov.dataMovimentacao.toLocaleDateString()} às {mov.dataMovimentacao.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  {mov.motivo && <p className={styles.motivo}>{mov.motivo}</p>}
                </div>
                <div className={`${styles.qty} ${isPos ? styles.qtyPos : styles.qtyNeg}`}>
                  {isPos ? '+' : ''}{mov.delta}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
