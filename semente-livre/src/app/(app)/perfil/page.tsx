'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/feedback/Toast';
import { useRouter } from 'next/navigation';
import { updateDoc, doc } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import styles from './perfil.module.css';

export default function PerfilPage() {
  const { proprietario, user, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ atual: '', nova: '', confirmar: '' });
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');

  const handleLogout = async () => {
    await logout();
    router.push('/entrar');
  };

  const handleChangePwd = async () => {
    setPwdError('');
    if (pwdForm.nova.length < 8) { setPwdError('Nova senha deve ter ao menos 8 caracteres.'); return; }
    if (pwdForm.nova !== pwdForm.confirmar) { setPwdError('As senhas não coincidem.'); return; }
    if (!user?.email) return;
    setSavingPwd(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, pwdForm.atual);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, pwdForm.nova);
      setShowChangePwd(false);
      setPwdForm({ atual: '', nova: '', confirmar: '' });
      showToast('Senha alterada com sucesso!', 'success');
    } catch { setPwdError('Senha atual incorreta ou erro ao alterar.'); }
    finally { setSavingPwd(false); }
  };

  const name = proprietario?.nome || user?.email || 'Usuário';
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className={styles.page}>
      {/* Avatar */}
      <div className={styles.avatarSection}>
        <div className={styles.avatar} aria-label={`Foto de perfil — inicial ${initial}`}>
          <span>{initial}</span>
        </div>
        <h2 className={styles.name}>{name}</h2>
        <p className={styles.email}>{user?.email}</p>
      </div>

      {/* Dados pessoais */}
      {proprietario && (
        <div className={styles.card}>
          <p className={styles.cardTitle}>Dados Pessoais</p>
          <div className={styles.dataRow}><span className={styles.dataLabel}>Telefone</span><span className={styles.dataValue}>{proprietario.telefone || '—'}</span></div>
          <div className={styles.dataRow}><span className={styles.dataLabel}>Município</span><span className={styles.dataValue}>{proprietario.logradouro?.municipio || '—'}/{proprietario.logradouro?.uf || '—'}</span></div>
          <div className={styles.dataRow}><span className={styles.dataLabel}>CEP</span><span className={styles.dataValue}>{proprietario.logradouro?.cep || '—'}</span></div>
        </div>
      )}

      {/* Ações de conta */}
      <div className={styles.card}>
        <p className={styles.cardTitle}>Conta</p>
        <Button variant="ghost" fullWidth onClick={() => setShowChangePwd(true)}>
          🔐 Alterar Senha
        </Button>
      </div>

      {/* Sobre */}
      <div className={styles.card}>
        <p className={styles.cardTitle}>Sobre</p>
        <p className={styles.about}>Semente Livre v1.0.0</p>
        <p className={styles.about}>IF Sudeste MG — Campus Rio Pomba</p>
        <p className={styles.about}>Gestão de bancos de sementes crioulas para produtores rurais familiares.</p>
      </div>

      {/* Logout */}
      <Button variant="danger" fullWidth size="lg" onClick={() => setShowLogout(true)}>
        Sair do Aplicativo
      </Button>

      {/* Logout confirm */}
      <ConfirmDialog
        isOpen={showLogout}
        title="Sair do aplicativo"
        description="Tem certeza que deseja sair?"
        confirmLabel="Sair"
        confirmVariant="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogout(false)}
      />

      {/* Change password dialog */}
      <Dialog isOpen={showChangePwd} onClose={() => { setShowChangePwd(false); setPwdError(''); setPwdForm({ atual: '', nova: '', confirmar: '' }); }} title="Alterar Senha">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {pwdError && <div style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger-dark)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)' }}>⚠ {pwdError}</div>}
          <Input label="Senha atual" type="password" value={pwdForm.atual} onChange={(e) => setPwdForm(p => ({ ...p, atual: e.target.value }))} required />
          <Input label="Nova senha" type="password" value={pwdForm.nova} onChange={(e) => setPwdForm(p => ({ ...p, nova: e.target.value }))} hint="Mínimo 8 caracteres" required />
          <Input label="Confirmar nova senha" type="password" value={pwdForm.confirmar} onChange={(e) => setPwdForm(p => ({ ...p, confirmar: e.target.value }))} required />
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="ghost" onClick={() => setShowChangePwd(false)} fullWidth>Cancelar</Button>
            <Button variant="primary" onClick={handleChangePwd} loading={savingPwd} fullWidth>Salvar</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
