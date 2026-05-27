/**
 * Camada de persistência local usando localStorage.
 * Substitui o Firestore do Firebase.
 */

function loadTable<T extends { id: string }>(table: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(`sl_${table}`) || '[]') as T[];
  } catch {
    return [];
  }
}

function saveTable<T>(table: string, rows: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`sl_${table}`, JSON.stringify(rows));
}

export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

// ── Generic CRUD ────────────────────────────────────────────────────────────

export function dbGetAll<T extends { id: string }>(table: string): T[] {
  return loadTable<T>(table);
}

export function dbGet<T extends { id: string }>(table: string, id: string): T | null {
  return loadTable<T>(table).find((r) => r.id === id) ?? null;
}

export function dbQuery<T extends { id: string }>(
  table: string,
  predicate: (row: T) => boolean
): T[] {
  return loadTable<T>(table).filter(predicate);
}

export function dbAdd<T extends { id: string }>(table: string, data: Omit<T, 'id'>): T {
  const rows = loadTable<T>(table);
  const newRow = { ...data, id: generateId() } as T;
  rows.push(newRow);
  saveTable(table, rows);
  return newRow;
}

export function dbSet<T extends { id: string }>(table: string, doc: T): T {
  const rows = loadTable<T>(table);
  const idx = rows.findIndex((r) => r.id === doc.id);
  if (idx >= 0) rows[idx] = doc;
  else rows.push(doc);
  saveTable(table, rows);
  return doc;
}

export function dbUpdate<T extends { id: string }>(
  table: string,
  id: string,
  data: Partial<T>
): T | null {
  const rows = loadTable<T>(table);
  const idx = rows.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  rows[idx] = { ...rows[idx], ...data };
  saveTable(table, rows);
  return rows[idx];
}

export function dbDelete(table: string, id: string): void {
  const rows = loadTable<{ id: string }>(table);
  saveTable(
    table,
    rows.filter((r) => r.id !== id)
  );
}

// ── Subscriptions (poll-based, simulating onSnapshot) ───────────────────────

type Unsubscribe = () => void;

export function dbOnSnapshot<T extends { id: string }>(
  table: string,
  predicate: (row: T) => boolean,
  callback: (rows: T[]) => void
): Unsubscribe {
  // Fire immediately
  callback(dbQuery<T>(table, predicate));

  // Poll every 500 ms for changes triggered by other tabs or direct mutations
  const interval = setInterval(() => {
    callback(dbQuery<T>(table, predicate));
  }, 500);

  return () => clearInterval(interval);
}

export function dbOnSnapshotAll<T extends { id: string }>(
  table: string,
  callback: (rows: T[]) => void
): Unsubscribe {
  callback(dbGetAll<T>(table));
  const interval = setInterval(() => callback(dbGetAll<T>(table)), 500);
  return () => clearInterval(interval);
}


