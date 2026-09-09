# Semente Livre — Contexto do Projeto

## Visão geral

Projeto acadêmico com dois componentes:
- **Frontend mobile**: React Native / TypeScript, para gestão de sementes agrícolas (padrão MVP, backend Firebase para o app).
- **Backend**: Spring Boot (Java), pacote base `com.example.demo`. Implementa CRUD de Pessoa/Usuario/Proprietario/Admin. Gerenciamento de tasks via GitHub Issues, board no GitHub Projects ("Projeto Semente Livre").

Este arquivo cobre principalmente o **backend Spring Boot**.

## Onde está o código

O backend Spring Boot fica em **`/SementeLivre/estudo-spring-docker`**. Todo o código de entidades, DTOs, services, repositories e configuração de banco/Flyway está aí dentro.

## ANTES DE COMEÇAR QUALQUER TASK — varra o repositório

Não assuma nada a partir deste arquivo sem confirmar no código. Antes de escrever ou alterar código:

1. Explore a árvore de `estudo-spring-docker` (estrutura de pacotes, `pom.xml`/`build.gradle`, `application.properties`/`.yml`, `docker-compose`, pasta de migrações Flyway).
2. Leia as entidades já existentes (`Pessoa`, `Usuario`, `Proprietario`, `Admin`, `Logradouro`) e os enums, para saber o que realmente já está mapeado e com quais nomes/pacotes.
3. Veja os DTOs, services e repositories que já existem, e as migrações Flyway aplicadas, para não duplicar nem quebrar o que o #12 e o #29 entregaram.
4. Confirme as convenções reais de nomenclatura de pacote (este arquivo assume `com.example.demo`, mas valide no código).

Só depois de entender o estado atual, implemente a task pedida.

## Stack e decisões técnicas

- **ORM**: JPA/Hibernate.
- **Migração de schema**: Flyway.
- **Estratégia de herança**: Table Per Type (TPT) — `@Inheritance(strategy = InheritanceType.JOINED)`.
- **Camada de transferência**: DTOs de request/response separados das entidades (nunca expor entidade JPA direto na API).
- **Validação**: Bean Validation (`@NotNull`, `@Size`, `@Email`, `@Pattern`) nos DTOs.
- **Soft delete** (quando aplicável): `@SQLDelete` (sobrescreve o DELETE por um UPDATE `deleted = true`) + `@SQLRestriction` (filtra os soft-deletados nas queries). Cascade normal (`CascadeType.REMOVE`/`ALL`) continua funcionando pois o Hibernate intercepta o remove() e troca por update em cada entidade filha.

## Modelo de dados — domínio Pessoa

Referência: `docs/Modelo-Conceitual-Banco-Dados.md`

Entidade base `Pessoa` (tabela `pessoa_t`), com subclasses via TPT ligadas por FK `pessoa_id` (relação 1:1):

- `pessoa_t`: tipo_documento (enum CPF/CNPJ), documento, nome, telefone, email, senha_hash, logradouro_id, data_cadastro, data_ultima_alteracao
  - Constraints: UNIQUE (tipo_documento, documento), UNIQUE (email)
- `usuario_t`: id, pessoa_id
- `proprietario_t`: id, pessoa_id, rg, exibir_no_site_publico
- `admin_t`: id, pessoa_id, nivel_acesso

`Logradouro` se relaciona com `Pessoa` via `@ManyToOne` opcional.

## Status das issues

- **#12 — Estudo: JPA/Hibernate + herança TPT + DTOs — entidade Pessoa mapeada** → **Fechada (Done)**.
  Entregou: entidade `Pessoa` mapeada com JPA, herança TPT funcionando (Usuario/Proprietario/Admin), DTOs de create/update/response, Bean Validation (email e documento únicos), teste de persistência passando.

- **#29 — Dev 3 · S1 — Mapeamento Pessoa/Logradouro/enums** → **Aberta**.
  Expande o que foi feito no #12. Pendente:
  - Mapear `Logradouro` e o relacionamento ManyToOne/Optional com `Pessoa`
  - Criar enums Java (ex: `TipoDocumento`)
  - Repositories base para as entidades
  - Configurar/confirmar auditoria de datas (data_cadastro, data_ultima_alteracao)
  - Alinhar migração Flyway em conjunto com Dev 1

- **#61 — Dev 3 · S3 — Validações de pessoa (unicidade, hash, regras)** → **Aberta** (task atual).
  Implementar as validações de negócio do domínio de pessoas, na camada de **service** (antes de persistir):
  - Validar unicidade de documento (CPF/CNPJ), RG e email; documento duplicado → HTTP 409 (conflito), idem email e RG
  - Hash de senha com **BCrypt** no cadastro (e re-hash quando necessário); senha nunca salva em texto puro
  - Regras de validação de documento: dígito verificador, tamanho e tipo (CPF vs CNPJ); documento inválido é rejeitado
  - Tratar conflitos de unicidade com mensagens de erro adequadas
  - Observação: unicidade de negócio é validada no service (não confundir com as constraints UNIQUE do banco — as duas coexistem; a do banco é a última linha de defesa)

## Convenções

- Comunicação e nomenclatura de domínio em português (ex: `Pessoa`, `Proprietario`, `Logradouro`, `nivel_acesso`).
- Cada subclasse de Pessoa deve ficar em tabela própria (não usar SINGLE_TABLE nem JOINED sem chave explícita).
- DTOs de entrada validam antes de qualquer persistência.

## Notas

Este arquivo foi gerado a partir do histórico de conversa sobre o projeto; ajuste conforme o código real evoluir (pacotes, nomes de classes, etc.) para manter o Claude Code sempre atualizado.