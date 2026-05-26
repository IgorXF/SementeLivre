export interface Logradouro {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
}

export interface Pessoa {
  idPessoa: string;
  tipoDocumento: string;
  documento: string;
  nome: string;
  telefone: string;
  email: string;
  logradouro: Logradouro;
  dataCadastro: Date;
  dataUltimaAlteracao: Date;
}

export interface Proprietario extends Pessoa {
  idProprietario: string;
  rg: string;
  exibirNoSitePublico: boolean;
  fcmToken?: string;
}
