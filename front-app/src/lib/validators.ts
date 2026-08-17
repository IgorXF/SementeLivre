import { z } from 'zod';

export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleaned[10]);
}

export const cpfSchema = z
  .string()
  .min(1, 'CPF é obrigatório')
  .refine((v) => validateCPF(v), { message: 'CPF inválido' });

export const emailSchema = z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido');

export const senhaSchema = z
  .string()
  .min(8, 'Senha deve ter no mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Senha deve ter ao menos uma letra maiúscula')
  .regex(/[0-9]/, 'Senha deve ter ao menos um número');

export const telefoneSchema = z
  .string()
  .min(10, 'Telefone inválido')
  .max(15, 'Telefone inválido');

export const logradouroSchema = z.object({
  logradouro: z.string().min(1, 'Logradouro é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  municipio: z.string().min(1, 'Município é obrigatório'),
  uf: z.string().length(2, 'UF inválida'),
  cep: z.string().length(8, 'CEP inválido'),
});

export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export async function fetchCEP(cep: string): Promise<ViaCEPResponse | null> {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
    const data: ViaCEPResponse = await res.json();
    if (data.erro) return null;
    return data;
  } catch {
    return null;
  }
}

export function formatCPF(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function formatTelefone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  }
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

export function formatCEP(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2');
}
