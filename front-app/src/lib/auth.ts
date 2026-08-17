/**
 * Autenticação local simples usando localStorage.
 * Substitui Firebase Auth.
 *
 * Usuários são armazenados em localStorage com senha em hash simples (não use em produção real).
 * Para um app real use bcrypt via API route ou similar.
 */

import { generateId } from './db';

export interface LocalUser {
  uid: string;
  email: string;
  /** Senha em texto simples apenas para fins de demonstração local. */
  _passwordHash: string;
}

const USERS_KEY = 'sl_auth_users';
const SESSION_KEY = 'sl_auth_session';

// ── Helpers ─────────────────────────────────────────────────────────────────

function loadUsers(): LocalUser[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: LocalUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function hashPassword(password: string): string {
  // Trivial "hash" for local-only demo — NOT secure for production.
  return btoa(encodeURIComponent(password));
}

function checkPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// ── Session ──────────────────────────────────────────────────────────────────

export interface Session {
  uid: string;
  email: string;
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function setSession(session: Session | null): void {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

// ── Auth API ─────────────────────────────────────────────────────────────────

export interface AuthError {
  code: string;
  message: string;
}

export function createUserWithEmailAndPassword(
  email: string,
  password: string
): { user: Session } {
  const users = loadUsers();
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    const err: AuthError = {
      code: 'auth/email-already-in-use',
      message: 'Este e-mail já está cadastrado.',
    };
    throw err;
  }
  const newUser: LocalUser = {
    uid: generateId(),
    email,
    _passwordHash: hashPassword(password),
  };
  users.push(newUser);
  saveUsers(users);
  const session: Session = { uid: newUser.uid, email: newUser.email };
  setSession(session);
  return { user: session };
}

export function signInWithEmailAndPassword(
  email: string,
  password: string
): { user: Session } {
  const users = loadUsers();
  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!found || !checkPassword(password, found._passwordHash)) {
    const err: AuthError = {
      code: 'auth/invalid-credential',
      message: 'E-mail ou senha incorretos.',
    };
    throw err;
  }
  const session: Session = { uid: found.uid, email: found.email };
  setSession(session);
  return { user: session };
}

export function signOut(): void {
  setSession(null);
}

export function sendPasswordResetEmail(_email: string): void {
  // No-op in local mode — just pretend it worked.
}

export interface Credential {
  email: string;
  password: string;
}

export function reauthenticateWithCredential(uid: string, credential: Credential): void {
  const users = loadUsers();
  const found = users.find((u) => u.uid === uid);
  if (!found || !checkPassword(credential.password, found._passwordHash)) {
    const err: AuthError = {
      code: 'auth/wrong-password',
      message: 'Senha atual incorreta.',
    };
    throw err;
  }
}

export function updatePassword(uid: string, newPassword: string): void {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.uid === uid);
  if (idx < 0) return;
  users[idx]._passwordHash = hashPassword(newPassword);
  saveUsers(users);
}

/** Listeners for auth state changes */
type AuthCallback = (session: Session | null) => void;
const listeners = new Set<AuthCallback>();
let _currentSession: Session | null = getSession();

export function onAuthStateChanged(callback: AuthCallback): () => void {
  // Fire immediately with current state
  callback(_currentSession);
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyListeners(session: Session | null): void {
  _currentSession = session;
  listeners.forEach((cb) => cb(session));
}

// Patch signOut and signIn to notify listeners
const _origSignOut = signOut;
(global as unknown as Record<string, unknown>)['__slAuthSignOut'] = () => {
  setSession(null);
  notifyListeners(null);
};

const _origSignIn = signInWithEmailAndPassword;
(global as unknown as Record<string, unknown>)['__slAuthSignIn'] = (
  email: string,
  password: string
) => {
  const result = _origSignIn(email, password);
  notifyListeners(result.user);
  return result;
};

// Override exported functions via module-level wrappers — use wrappers in exports:

export function signInAndNotify(email: string, password: string): { user: Session } {
  const result = signInWithEmailAndPassword(email, password);
  notifyListeners(result.user);
  return result;
}

export function createUserAndNotify(
  email: string,
  password: string
): { user: Session } {
  const result = createUserWithEmailAndPassword(email, password);
  notifyListeners(result.user);
  return result;
}

export function signOutAndNotify(): void {
  _origSignOut();
  notifyListeners(null);
}
