'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProperties, useCommunities } from '@/hooks/useProperties';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/feedback/Toast';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { fetchCEP, formatCEP } from '@/lib/validators';
import styles from '@/app/(app)/sementes/nova/nova.module.css';
import formStyles from './propriedade.module.css';

export default function NovaPropriedadePage() {
  const { user } = useAuth();
  const { createProperty } = useProperties();
  const { communities, requestCommunity } = useCommunities();
  const { showToast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [showRequestCom, setShowRequestCom] = useState(false);
  const [newComNome, setNewComNome] = useState('');
  const [newComMun, setNewComMun] = useState('');
  const [newComUF, setNewComUF] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    nome: '', tamanhoHectares: '', idComunidade: '', nomeComunidade: '',
    cep: '', logradouro: '', numero: '', complemento: '', bairro: '', municipio: '', uf: '',
  });

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleCEP = async (raw: string) => {
    const formatted = formatCEP(raw);
    set('cep', formatted);
    if (raw.replace(/\D/g, '').length === 8) {
      setLoadingCEP(true);
      const data = await fetchCEP(raw);
      if (data) setForm((p) => ({ ...p, cep: formatted, logradouro: data.logradouro, bairro: data.bairro, municipio: data.localidade, uf: data.uf }));
      setLoadingCEP(false);
    }
  };

  const communityOptions = [
    { value: '', label: 'Selecione uma comunidade' },
    ...communities.map((c) => ({ value: c.idComunidade, label: `${c.nome} — ${c.municipio}/${c.uf}` })),
    { value: '__new__', label: '+ Minha comunidade não está na lista' },
  ];

  const handleCommunityChange = (val: string) => {
    if (val === '__new__') { setShowRequestCom(true); return; }
    const com = communities.find((c) => c.idComunidade === val);
    setForm((p) => ({ ...p, idComunidade: val, nomeComunidade: com?.nome || '' }));
  };

  const handleRequestCommunity = async () => {
    if (!newComNome || !newComMun) return;
    const id = await requestCommunity(newComNome, newComMun, newComUF);
    setForm((p) => ({ ...p, idComunidade: id, nomeComunidade: newComNome }));
    setShowRequestCom(false);
    showToast('Solicitação de comunidade enviada!', 'info');
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nome) e.nome = 'Nome é obrigatório';
    if (!form.idComunidade) e.idComunidade = 'Selecione uma comunidade';
    if (!form.municipio) e.municipio = 'Município é obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;
    setLoading(true);
    try {
      await createProperty({
        idProprietario: user.uid,
        idComunidade: form.idComunidade,
        nomeComunidade: form.nomeComunidade,
        nome: form.nome,
        tamanhoHectares: form.tamanhoHectares ? Number(form.tamanhoHectares) : undefined,
        logradouro: form.logradouro, numero: form.numero, complemento: form.complemento,
        bairro: form.bairro, municipio: form.municipio, uf: form.uf,
        cep: form.cep.replace(/\D/g, ''),
        dataCadastro: new Date(), dataUltimaAlteracao: new Date(),
      });
      showToast('Propriedade cadastrada!', 'success');
      router.push('/propriedades');
    } catch { showToast('Erro ao cadastrar propriedade.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <section className={styles.fieldset}>
          <h2 className={styles.legend}>Identificação da Propriedade</h2>
          <Input label="Nome da propriedade" value={form.nome} onChange={(e) => set('nome', e.target.value)} error={errors.nome} required />
          <Input label="Tamanho (hectares)" value={form.tamanhoHectares} onChange={(e) => set('tamanhoHectares', e.target.value)} type="number" inputMode="decimal" min="0" placeholder="Opcional" />
          <Select label="Comunidade" value={form.idComunidade} onChange={(e) => handleCommunityChange(e.target.value)} options={communityOptions} error={errors.idComunidade} required />
        </section>

        <section className={styles.fieldset}>
          <h2 className={styles.legend}>Endereço (Opcional)</h2>
          <Input label="CEP" value={form.cep} onChange={(e) => handleCEP(e.target.value)} inputMode="numeric" placeholder="00000-000" hint={loadingCEP ? 'Buscando CEP...' : undefined} />
          <Input label="Logradouro" value={form.logradouro} onChange={(e) => set('logradouro', e.target.value)} />
          <div className={formStyles.row}>
            <Input label="Número" value={form.numero} onChange={(e) => set('numero', e.target.value)} />
            <Input label="Complemento" value={form.complemento} onChange={(e) => set('complemento', e.target.value)} placeholder="Opcional" />
          </div>
          <div className={formStyles.row}>
            <div style={{ flex: 2 }}><Input label="Município" value={form.municipio} onChange={(e) => set('municipio', e.target.value)} error={errors.municipio} required /></div>
            <div style={{ flex: 1 }}><Input label="UF" value={form.uf} onChange={(e) => set('uf', e.target.value.toUpperCase().slice(0, 2))} maxLength={2} /></div>
          </div>
        </section>

        <Button type="submit" fullWidth size="lg" loading={loading}>Cadastrar Propriedade</Button>
      </form>

      <Dialog isOpen={showRequestCom} onClose={() => setShowRequestCom(false)} title="Solicitar Nova Comunidade">
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
          Sua solicitação será analisada. A propriedade ficará vinculada provisoriamente.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input label="Nome da Comunidade" value={newComNome} onChange={(e) => setNewComNome(e.target.value)} required />
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <div style={{ flex: 2 }}><Input label="Município" value={newComMun} onChange={(e) => setNewComMun(e.target.value)} required /></div>
            <div style={{ flex: 1 }}><Input label="UF" value={newComUF} onChange={(e) => setNewComUF(e.target.value.toUpperCase().slice(0, 2))} maxLength={2} /></div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="ghost" onClick={() => setShowRequestCom(false)} fullWidth>Cancelar</Button>
            <Button variant="primary" onClick={handleRequestCommunity} fullWidth>Enviar Solicitação</Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
