'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSeeds } from '@/hooks/useSeeds';
import { DisponibilidadeProduto, DisponibilidadeLabels } from '@/types/stock';
import { TipoProdutoLabels } from '@/types/seed';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import styles from './sementes.module.css';

const disponibilidadeFilters = [
  { value: 'TODAS', label: 'Todas' },
  ...Object.entries(DisponibilidadeLabels).map(([v, l]) => ({ value: v, label: l })),
];

export default function SementesPage() {
  const { seeds, loading } = useSeeds();
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [filtroDisp, setFiltroDisp] = useState('TODAS');

  const filtered = useMemo(() => {
    return seeds.filter((s) => {
      const matchBusca = busca === '' ||
        s.nomePopular.toLowerCase().includes(busca.toLowerCase());
      const matchDisp = filtroDisp === 'TODAS' || s.disponibilidade === filtroDisp;
      return matchBusca && matchDisp;
    });
  }, [seeds, busca, filtroDisp]);

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <input
          type="search"
          className={styles.search}
          placeholder="🔍  Buscar semente..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar semente"
        />
        <Link href="/sementes/nova">
          <Button variant="primary" size="md" aria-label="Cadastrar nova semente">+ Nova</Button>
        </Link>
      </div>

      <div className={styles.filters} role="group" aria-label="Filtrar por disponibilidade">
        {disponibilidadeFilters.map((f) => (
          <button
            key={f.value}
            className={`${styles.chip} ${filtroDisp === f.value ? styles.chipActive : ''}`}
            onClick={() => setFiltroDisp(f.value)}
            aria-pressed={filtroDisp === f.value}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.list}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={`skeleton ${styles.skeletonCard}`} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        seeds.length === 0 ? (
          <EmptyState
            icon="🌱"
            title="Nenhuma semente cadastrada"
            description="Cadastre sua primeira semente crioula para começar a gerenciar seu banco."
            actionLabel="Cadastrar Semente"
            onAction={() => router.push('/sementes/nova')}
          />
        ) : (
          <EmptyState icon="🔍" title="Nenhum resultado" description="Tente outro filtro ou termo de busca." />
        )
      ) : (
        <ul className={styles.list} aria-label={`${filtered.length} sementes encontradas`}>
          {filtered.map((seed) => (
            <li key={seed.idEstoque}>
              <Link href={`/sementes/${seed.idEstoque}`} className={styles.card}>
                <div className={styles.cardImg}>
                  {seed.urlFoto ? (
                    <img src={seed.urlFoto} alt={`Foto de ${seed.nomePopular}`} className={styles.img} />
                  ) : (
                    <span className={styles.imgPlaceholder} aria-hidden="true">🌱</span>
                  )}
                </div>
                <div className={styles.cardContent}>
                  <p className={styles.cardName}>{seed.nomePopular}</p>
                  <p className={styles.cardQty}>{seed.quantidade} {seed.tipoPesagem}</p>
                  <Badge variant="availability" value={seed.disponibilidade} />
                </div>
                <span className={styles.chevron} aria-hidden="true">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
