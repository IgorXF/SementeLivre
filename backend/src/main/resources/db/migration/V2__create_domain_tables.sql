CREATE TABLE logradouro_t (
    id UUID PRIMARY KEY,
    logradouro VARCHAR(100) NOT NULL,
    numero VARCHAR(255),
    complemento VARCHAR(255),
    bairro VARCHAR(255),
    municipio VARCHAR(100) NOT NULL,
    uf VARCHAR(2) NOT NULL,
    cep VARCHAR(255)
);

CREATE TABLE proprietario_t (
    id UUID PRIMARY KEY,
    pessoa_id UUID
);

CREATE TABLE comunidade_t (
    id UUID PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    logradouro_id UUID NOT NULL REFERENCES logradouro_t(id),
    status VARCHAR(30) NOT NULL,
    data_solicitacao TIMESTAMP NOT NULL,
    data_aprovacao TIMESTAMP
);

CREATE TABLE propriedade_t (
    id UUID PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    tamanho_hectares NUMERIC NOT NULL,
    logradouro_id UUID NOT NULL REFERENCES logradouro_t(id),
    proprietario_id UUID NOT NULL REFERENCES proprietario_t(id),
    comunidade_id UUID NOT NULL REFERENCES comunidade_t(id),
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_ultima_alteracao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
