import { MovimentacaoEstoque, TipoMovimentacao } from '@/types/stock';

export const mockMovimentacoes: MovimentacaoEstoque[] = [
  // Movimentações para Milho Crioulo (mock-semente-1)
  {
    id: 'mock-mov-1',
    idProduto: 'mock-semente-1',
    idProprietario: 'any',
    tipo: TipoMovimentacao.ENTRADA,
    quantidade: 200,
    delta: 200,
    motivo: 'Colheita da safra inicial',
    dataMovimentacao: new Date('2026-05-15T08:00:00'),
  },
  {
    id: 'mock-mov-2',
    idProduto: 'mock-semente-1',
    idProprietario: 'any',
    tipo: TipoMovimentacao.SAIDA_VENDA,
    quantidade: 180,
    delta: -20,
    motivo: 'Venda para cooperativa local',
    dataMovimentacao: new Date('2026-05-18T14:30:00'),
  },
  {
    id: 'mock-mov-3',
    idProduto: 'mock-semente-1',
    idProprietario: 'any',
    tipo: TipoMovimentacao.SAIDA_DOACAO,
    quantidade: 150,
    delta: -30,
    motivo: 'Doação para projeto de horta comunitária',
    dataMovimentacao: new Date('2026-05-20T09:15:00'),
  },

  // Movimentações para Muda de Laranjeira (mock-semente-2)
  {
    id: 'mock-mov-4',
    idProduto: 'mock-semente-2',
    idProprietario: 'any',
    tipo: TipoMovimentacao.ENTRADA,
    quantidade: 20,
    delta: 20,
    motivo: 'Compra de mudas do viveiro central',
    dataMovimentacao: new Date('2026-05-10T10:00:00'),
  },
  {
    id: 'mock-mov-5',
    idProduto: 'mock-semente-2',
    idProprietario: 'any',
    tipo: TipoMovimentacao.SAIDA_VENDA,
    quantidade: 12,
    delta: -8,
    motivo: 'Venda direta na feira',
    dataMovimentacao: new Date('2026-05-21T11:45:00'),
  },

  // Movimentações para Feijão Guandu (mock-semente-3)
  {
    id: 'mock-mov-6',
    idProduto: 'mock-semente-3',
    idProprietario: 'any',
    tipo: TipoMovimentacao.ENTRADA,
    quantidade: 50,
    delta: 50,
    motivo: 'Sementes guardadas da safra anterior',
    dataMovimentacao: new Date('2026-05-22T08:30:00'),
  },

  // Movimentações para Sementes de Abóbora (mock-semente-4)
  {
    id: 'mock-mov-7',
    idProduto: 'mock-semente-4',
    idProprietario: 'any',
    tipo: TipoMovimentacao.ENTRADA,
    quantidade: 500,
    delta: 500,
    motivo: 'Extração manual das abóboras cabotiá',
    dataMovimentacao: new Date('2026-05-23T16:20:00'),
  }
];
