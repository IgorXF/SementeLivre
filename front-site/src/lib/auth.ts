const AUTH_KEY = "sementes_auth_user";

export interface AuthUser {
  email: string;
  nome: string;
  role: "admin" | "produtor";
  id_comunidade?: string;
  nome_comunidade?: string;
}

export function setAuthUser(user: AuthUser): void {
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem(AUTH_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    return null;
  }
}

export function logout(): void {
  sessionStorage.removeItem(AUTH_KEY);
}
