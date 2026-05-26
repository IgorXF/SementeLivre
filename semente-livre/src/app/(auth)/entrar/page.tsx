'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import styles from './entrar.module.css';

export default function EntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !senha) { setError('Preencha todos os campos.'); return; }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      router.push('/dashboard');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos.');
      } else if (code === 'auth/network-request-failed') {
        setError('Verifique sua conexão com a internet.');
      } else {
        setError('Ocorreu um erro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.logo}>
        <span className={styles.logoIcon} aria-hidden="true">🌱</span>
        <h1 className={styles.logoText}>Semente Livre</h1>
        <p className={styles.logoSub}>IF Sudeste MG</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <h2 className={styles.title}>Entrar na conta</h2>

        {error && (
          <div className={styles.errorBox} role="alert" aria-live="assertive">
            ⚠ {error}
          </div>
        )}

        <Input
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          inputMode="email"
          required
          placeholder="seu@email.com"
        />

        <Input
          label="Senha"
          type={showSenha ? 'text' : 'password'}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          autoComplete="current-password"
          required
          placeholder="Sua senha"
          rightIcon={<span style={{ fontSize: 18 }}>{showSenha ? '🙈' : '👁'}</span>}
          onRightIconClick={() => setShowSenha(!showSenha)}
        />

        <Link href="/recuperar-senha" className={styles.forgotLink}>
          Esqueceu sua senha?
        </Link>

        <Button type="submit" fullWidth loading={loading} size="lg">
          Entrar
        </Button>
      </form>

      <p className={styles.registerLink}>
        Ainda não tem conta?{' '}
        <Link href="/cadastrar">Cadastre-se</Link>
      </p>
    </div>
  );
}
