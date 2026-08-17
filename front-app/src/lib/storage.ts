/**
 * Armazenamento local de arquivos usando localStorage (base64).
 * Substitui o Firebase Storage.
 *
 * Atenção: localStorage tem limite de ~5-10 MB. Para imagens grandes use IndexedDB em produção.
 */

const STORAGE_KEY_PREFIX = 'sl_storage_';

export function uploadFile(path: string, file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${path}`, dataUrl);
        resolve(dataUrl);
      } catch {
        // If localStorage is full, return an object URL as fallback (in-memory only)
        resolve(URL.createObjectURL(file));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

export function getDownloadURL(path: string): Promise<string> {
  const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${path}`);
  if (stored) return Promise.resolve(stored);
  return Promise.reject(new Error(`Arquivo não encontrado: ${path}`));
}

export function deleteFile(path: string): void {
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${path}`);
}
