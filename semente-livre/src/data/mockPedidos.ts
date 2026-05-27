import { Pedido, StatusPedido, TipoPedido } from '@/types/order';

export const mockPedidos: Pedido[] = [
  {
    idPedido: 'mock-pedido-1',
    idProprietario: 'any',
    nomeRecebedor: 'Fazenda Boa Esperança',
    tipoPedido: TipoPedido.VENDA,
    status: StatusPedido.PENDENTE,
    dataPedido: new Date('2026-05-24'),
    itens: [
      {
        idItem: 'item-1',
        idProduto: 'mock-semente-1',
        nomePopular: 'Milho Crioulo',
        quantidade: 10,
        tipoPesagem: 'KG',
        precoUnitario: 25.5
      }
    ],
    totalValor: 255.0,
    mensagemOpcional: 'Entregar na portaria principal'
  },
  {
    idPedido: 'mock-pedido-2',
    idProprietario: 'any',
    nomeRecebedor: 'Associação de Agricultores',
    tipoPedido: TipoPedido.DOACAO,
    status: StatusPedido.CONFIRMADO,
    dataPedido: new Date('2026-05-25'),
    itens: [
      {
        idItem: 'item-2',
        idProduto: 'mock-semente-4',
        nomePopular: 'Muda de Laranjeira',
        quantidade: 100,
        tipoPesagem: 'UNIDADE'
      }
    ],
    totalValor: 0,
  }
];
