'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProperties } from '@/hooks/useProperties';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import styles from './propriedades.module.css';

export default function PropriedadesPage() {
  const { properties, loading } = useProperties();
  const router = useRouter();

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/propriedades/nova">
          <Button variant="primary" size="md">+ Nova Propriedade</Button>
        </Link>
      </div>

      {loading ? (
        <div className={styles.list}>
          {[1, 2].map(i => <div key={i} className={`skeleton ${styles.skeletonCard}`} />)}
        </div>
      ) : properties.length === 0 ? (
        <EmptyState
          icon="🏡"
          title="Nenhuma propriedade cadastrada"
          description="Cadastre uma propriedade para associar suas sementes."
          actionLabel="Cadastrar Propriedade"
          onAction={() => router.push('/propriedades/nova')}
        />
      ) : (
        <ul className={styles.list}>
          {properties.map((prop) => (
            <li key={prop.idPropriedade}>
              <Link href={`/propriedades/${prop.idPropriedade}`} className={styles.card}>
                <div className={styles.cardIcon} aria-hidden="true">🏡</div>
                <div className={styles.cardContent}>
                  <p className={styles.cardName}>{prop.nome}</p>
                  <p className={styles.cardLocation}>{prop.municipio}/{prop.uf}</p>
                  <p className={styles.cardCommunity}>{prop.nomeComunidade}</p>
                  {prop.tamanhoHectares && <p className={styles.cardSize}>{prop.tamanhoHectares} hectares</p>}
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
