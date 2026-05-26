'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import styles from '../entrar/entrar.module.css';
import localStyles from './recuperar.module.css';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(email);
      setSent(true);
    } catch {
      // Don't reveal if email exists
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className={localStyles.sent}>
        <span className={localStyles.sentIcon} aria-hidden="true">📧</span>
        <h1 className={localStyles.sentTitle}>E-mail enviado!</h1>
        <p className={localStyles.sentDesc}>
          Se esse e-mail estiver cadastrado, você receberá um link para redefinir sua senha. Verifique sua caixa de entrada.
        </p>
        <Link href="/entrar">
          <Button variant="primary" fullWidth>Voltar para o Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.logo}>
        <span style={{ fontSize: '3rem' }} aria-hidden="true">🔐</span>
        <h1 className={styles.logoText}>Recuperar Senha</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)', lineHeight: 1.6 }}>
          Digite seu e-mail e enviaremos um link para criar uma nova senha.
        </p>

        {error && (
          <div className={styles.errorBox} role="alert">⚠ {error}</div>
        )}

        <Input
          label="E-mail cadastrado"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          inputMode="email"
          required
          placeholder="seu@email.com"
        />

        <Button type="submit" fullWidth loading={loading} size="lg">
          Enviar link de recuperação
        </Button>
      </form>

      <p className={styles.registerLink}>
        <Link href="/entrar">← Voltar para o login</Link>
      </p>
    </div>
  );
}
