'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sprout, BarChart2, List, Pencil, Trash2, PackageSearch } from 'lucide-react';
import { useSeeds } from '@/hooks/useSeeds';
import { useToast } from '@/components/feedback/Toast';
import { Estoque, DisponibilidadeLabels, PesagemLabels, TipoMovimentacao } from '@/types/stock';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/feedback/EmptyState';
import Link from 'next/link';
import styles from './semente.module.css';

export default function SementeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getSeed, updateSeed, deleteSeed } = useSeeds();
  const { showToast } = useToast();

  const [seed, setSeed] = useState<Estoque | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Estoque>>({});
  const [showDelete, setShowDelete] = useState(false);
  const [showAjuste, setShowAjuste] = useState(false);
  const [ajusteDir, setAjusteDir] = useState<'Adicionar' | 'Subtrair'>('Adicionar');
  const [ajusteQty, setAjusteQty] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getSeed(id).then((s) => { setSeed(s); setLoading(false); });
  }, [id, getSeed]);

  if (loading) return <div className={styles.loading}><div className="skeleton" style={{ height: 200, borderRadius: 16 }} /></div>;
  if (!seed) return <EmptyState icon={<PackageSearch size={38} strokeWidth={1.5} />} title="Produto nao encontrado" actionLabel="Voltar" onAction={() => router.push('/sementes')} />;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSeed(id, editForm);
      setSeed((prev) => prev ? { ...prev, ...editForm } : prev);
      setEditing(false);
      showToast('Produto atualizado!', 'success');
    } catch { showToast('Erro ao salvar.', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteSeed(id);
      showToast('Produto removido.', 'success');
      router.push('/sementes');
    } catch { showToast('Erro ao excluir.', 'error'); }
    finally { setDeleting(false); }
  };

  const handleAjuste = async () => {
    const delta = Number(ajusteQty);
    if (!delta || delta <= 0) return;
    const novaQty = ajusteDir === 'Adicionar' ? seed.quantidade + delta : seed.quantidade - delta;
    if (novaQty < 0) { showToast('Estoque nao pode ser negativo.', 'error'); return; }
    setSaving(true);
    try {
      await updateSeed(id, { quantidade: novaQty });
      setSeed((prev) => prev ? { ...prev, quantidade: novaQty } : prev);
      setShowAjuste(false);
      setAjusteQty('');
      showToast('Estoque ajustado!', 'success');
    } catch { showToast('Erro ao ajustar.', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className={styles.page}>
      {/* Foto */}
      <div className={styles.photoHero}>
        {seed.urlFoto ? (
          <img src={seed.urlFoto} alt={`Foto de ${seed.nomePopular}`} className={styles.heroImg} />
        ) : (
          <div className={styles.heroPlaceholder}>
            <Sprout size={48} strokeWidth={1.5} />
          </div>
        )}
      </div>

      {editing ? (
        <div className={styles.editForm}>
          <Input label="Nome popular" value={editForm.nomePopular ?? seed.nomePopular} onChange={(e) => setEditForm((p) => ({ ...p, nomePopular: e.target.value }))} required />
          <Input label="Quantidade" type="number" value={String(editForm.quantidade ?? seed.quantidade)} onChange={(e) => setEditForm((p) => ({ ...p, quantidade: Number(e.target.value) }))} inputMode="decimal" />
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="ghost" onClick={() => setEditing(false)} fullWidth>Cancelar</Button>
            <Button variant="primary" onClick={handleSave} loading={saving} fullWidth>Salvar</Button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.info}>
            <div className={styles.titleRow}>
              <h2 className={styles.name}>{seed.nomePopular}</h2>
              <Badge variant="availability" value={seed.disponibilidade} />
            </div>
            {seed.descricao && <p className={styles.desc}>{seed.descricao}</p>}

            <div className={styles.grid}>
              <div className={styles.gridItem}>
                <span className={styles.gridLabel}>Quantidade</span>
                <span className={styles.gridValue}>{seed.quantidade} {PesagemLabels[seed.tipoPesagem] || seed.tipoPesagem}</span>
              </div>
              {seed.preco && (
                <div className={styles.gridItem}>
                  <span className={styles.gridLabel}>Preco</span>
                  <span className={styles.gridValue}>R$ {seed.preco.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Estoque actions */}
          <div className={styles.stockSection}>
            <Button variant="secondary" fullWidth onClick={() => setShowAjuste(true)}>
              <BarChart2 size={16} strokeWidth={2} />
              Ajustar Estoque
            </Button>
            <Link href={`/sementes/${id}/estoque`}>
              <Button variant="ghost" fullWidth>
                <List size={16} strokeWidth={2} />
                Ver Movimentacoes
              </Button>
            </Link>
          </div>

          <div className={styles.actions}>
            <Button variant="ghost" fullWidth onClick={() => { setEditing(true); setEditForm({}); }}>
              <Pencil size={15} strokeWidth={2} />
              Editar
            </Button>
            <Button variant="danger" fullWidth onClick={() => setShowDelete(true)}>
              <Trash2 size={15} strokeWidth={2} />
              Excluir
            </Button>
          </div>
        </>
      )}

      {/* Ajuste dialog */}
      <Dialog isOpen={showAjuste} onClose={() => setShowAjuste(false)} title="Ajustar Estoque">
        <p className={styles.dialogInfo}>Estoque atual: <strong>{seed.quantidade} {PesagemLabels[seed.tipoPesagem]}</strong></p>
        <Toggle options={[{ value: 'Adicionar', label: 'Adicionar' }, { value: 'Subtrair', label: 'Subtrair' }]} value={ajusteDir} onChange={(v) => setAjusteDir(v as 'Adicionar' | 'Subtrair')} />
        <Input label="Quantidade" value={ajusteQty} onChange={(e) => setAjusteQty(e.target.value)} type="number" inputMode="decimal" min="0" />
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
          <Button variant="ghost" onClick={() => setShowAjuste(false)} fullWidth>Cancelar</Button>
          <Button variant="primary" onClick={handleAjuste} loading={saving} fullWidth>Confirmar</Button>
        </div>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={showDelete}
        title="Excluir Produto"
        description="Tem certeza? O produto sera removido, mas os pedidos anteriores serao mantidos."
        confirmLabel="Excluir"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        loading={deleting}
      />
    </div>
  );
}
