export enum TipoProduto {
  HORTALICA = 'HORTALICA',
  FRUTIFERA = 'FRUTIFERA',
  FORRAGEIRA = 'FORRAGEIRA',
  CEREAL = 'CEREAL',
  LEGUMINOSA = 'LEGUMINOSA',
  OUTRAS = 'OUTRAS',
}

export const TipoProdutoLabels: Record<TipoProduto, string> = {
  [TipoProduto.HORTALICA]: 'Hortaliça',
  [TipoProduto.FRUTIFERA]: 'Frutífera',
  [TipoProduto.FORRAGEIRA]: 'Forrageira',
  [TipoProduto.CEREAL]: 'Cereal',
  [TipoProduto.LEGUMINOSA]: 'Leguminosa',
  [TipoProduto.OUTRAS]: 'Outras',
};

export enum EspecieGeral {
  FEIJAO = 'FEIJAO',
  MILHO = 'MILHO',
  ABOBORA = 'ABOBORA',
  ALFACE = 'ALFACE',
  ARROZ = 'ARROZ',
  CEBOLA = 'CEBOLA',
  ALHO = 'ALHO',
  OUTRAS = 'OUTRAS',
}

export const EspecieGeralLabels: Record<EspecieGeral, string> = {
  [EspecieGeral.FEIJAO]: 'Feijão',
  [EspecieGeral.MILHO]: 'Milho',
  [EspecieGeral.ABOBORA]: 'Abóbora',
  [EspecieGeral.ALFACE]: 'Alface',
  [EspecieGeral.ARROZ]: 'Arroz',
  [EspecieGeral.CEBOLA]: 'Cebola',
  [EspecieGeral.ALHO]: 'Alho',
  [EspecieGeral.OUTRAS]: 'Outras',
};

export enum FormatoProduto {
  MUDA = 'MUDA',
  SEMENTE = 'SEMENTE',
}

export const FormatoProdutoLabels: Record<FormatoProduto, string> = {
  [FormatoProduto.MUDA]: 'Muda',
  [FormatoProduto.SEMENTE]: 'Semente',
};

export interface Produto {
  idProduto: string;
  idProprietario: string;
  nomePopular: string;
  nomeCientifico?: string;
  historico?: string;
  urlFoto: string;
  tipo: TipoProduto;
  especie: EspecieGeral;
  formato: FormatoProduto;
  dataInclusao: Date;
  dataUltimaAlteracao: Date;
}
