import { Pedido, StatusPedido, TipoPedido } from '@/types/order';

export const mockPedidos: Pedido[] = [
  {
    idPedido: 'mock-pedido-1',
    idProprietario: 'any',
    idRecebedor: 'comprador-1',
    nomeRecebedor: 'Fazenda Boa Esperança',
    tipoPedido: TipoPedido.VENDA,
    status: StatusPedido.PENDENTE,
    dataPedido: new Date('2026-05-24'),
    itens: [
      {
        idSemente: 'mock-semente-1',
        quantidade: 10,
        precoUnitario: 25.5
      }
    ],
    valorTotal: 255.0,
    notas: 'Entregar na portaria principal'
  },
  {
    idPedido: 'mock-pedido-2',
    idProprietario: 'any',
    idRecebedor: 'comprador-2',
    nomeRecebedor: 'Associação de Agricultores',
    tipoPedido: TipoPedido.DOACAO,
    status: StatusPedido.CONFIRMADO,
    dataPedido: new Date('2026-05-25'),
    itens: [
      {
        idSemente: 'mock-semente-4',
        quantidade: 100,
      }
    ],
    valorTotal: 0,
  }
];
