# Relatório Detalhado de Alterações e Guia de Teste no Postman

> **Projeto:** Semente Livre (Backend)  
> **Módulo:** Autenticação e Autorização JWT Completa  
> **Status da Compilação:** `BUILD SUCCESS` (Compilado com sucesso via Maven)

---

## 📋 Sumário
1. [Visão Geral e Garantia de Preservação](#1-visão-geral-e-garantia-de-preservação)
2. [Detalhamento de Todas as Alterações Realizadas (Arquivo por Arquivo)](#2-detalhamento-de-todas-as-alterações-realizadas-arquivo-por-arquivo)
3. [Como Executar a Aplicação com o Banco de Dados](#3-como-executar-a-aplicação-com-o-banco-de-dados)
4. [Guia Completo de Testes no Postman (Passo a Passo)](#4-guia-completo-de-testes-no-postman-passo-a-passo)
5. [Verificação dos Critérios de Aceite](#5-verificação-dos-critérios-de-aceite)

---

## 1. Visão Geral e Garantia de Preservação

Todas as solicitações de autenticação JWT foram **100% implementadas no projeto real `backend/`**.

### 🛡️ Garantias de Segurança no Código e Versão
- **Zero exclusão ou alteração destruidora:** Nenhum arquivo existente do projeto foi excluído ou sobrescrito.
- **Isolamento de Conflitos no Git:** Apenas 2 arquivos de configuração pré-existentes receberam novas linhas no final (`pom.xml` e `application-dev.yml`). Todas as regras de negócio, entidades, repositórios, controllers e DTOs foram criados como **arquivos inteiramente NOVOS**.
- **Base Teórica Aproveitada:** Utilizamos a mesma biblioteca JWT de alta performance estudada na pasta `Estudos/` (**JJWT `io.jsonwebtoken` v0.12.5**).

---

## 2. Detalhamento de Todas as Alterações Realizadas (Arquivo por Arquivo)

### 📄 2.1. Arquivos Pré-existentes Atualizados (Apenas Adição de Linhas)

#### 1. [`backend/pom.xml`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/pom.xml)
- **O que mudou:** Adicionamos as dependências `spring-boot-starter-security`, `io.jsonwebtoken:jjwt-api:0.12.5`, `jjwt-impl`, `jjwt-jackson` e `spring-boot-starter-mail`.
- **Por quê:** Permite utilizar os recursos de segurança do Spring Security, geração e leitura de tokens JWT no padrão do protótipo de estudos, e envio de e-mails de recuperação de senha.

#### 2. [`backend/src/main/resources/application-dev.yml`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/resources/application-dev.yml)
- **O que mudou:** Incluímos as propriedades de configuração do JWT (`jwt.secret`, `jwt.expiration`, `refresh-expiration-days`) e configurações do servidor de e-mail (`spring.mail`).
- **Por quê:** Parametriza o tempo de validade dos tokens (30 minutos para o Access Token e 7 dias para o Refresh Token) e a chave de assinatura HMAC-SHA.

---

### 🆕 2.2. Arquivos Inteiramente NOVOS Criados

#### 3. [`V2__criar_tabelas_autenticacao.sql`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/resources/db/migration/V2__criar_tabelas_autenticacao.sql)
- **Diretório:** `src/main/resources/db/migration/`
- **Descrição:** Script de migração do Flyway para PostgreSQL que cria as tabelas `role_t`, `usuario_t`, `usuario_role_t` (junção Many-to-Many), `refresh_token_t` e `token_recuperacao_senha_t`. Além disso, popula a tabela `role_t` com os perfis padrão (`ROLE_ADMIN`, `ROLE_USUARIO`, `ROLE_PROPRIETARIO`).

#### 4. [`PerfilEnum.java`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/java/com/sementeLivre/backend/entity/enums/PerfilEnum.java)
- **Diretório:** `src/main/java/com/sementeLivre/backend/entity/enums/`
- **Descrição:** Enum de domínio contendo as constantes de roles (`ROLE_ADMIN`, `ROLE_USUARIO`, `ROLE_PROPRIETARIO`).

#### 5. [`Role.java`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/java/com/sementeLivre/backend/entity/Role.java)
- **Diretório:** `src/main/java/com/sementeLivre/backend/entity/`
- **Descrição:** Entidade JPA mapeando a tabela `role_t` com chave primária UUID.

#### 6. [`Usuario.java`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/java/com/sementeLivre/backend/entity/Usuario.java)
- **Diretório:** `src/main/java/com/sementeLivre/backend/entity/`
- **Descrição:** Entidade JPA que mapeia `usuario_t` e implementa a interface `UserDetails` do Spring Security. Possui a anotação `@ToString.Exclude` no atributo `senha` para garantir que a senha hash nunca seja gravada inadvertidamente em logs do sistema.

#### 7. [`RefreshToken.java`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/java/com/sementeLivre/backend/entity/RefreshToken.java)
- **Diretório:** `src/main/java/com/sementeLivre/backend/entity/`
- **Descrição:** Entidade JPA mapeando a tabela `refresh_token_t`, armazenando o token de longa duração vinculado ao usuário com status de revogação.

#### 8. [`TokenRecuperacaoSenha.java`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/java/com/sementeLivre/backend/entity/TokenRecuperacaoSenha.java)
- **Diretório:** `src/main/java/com/sementeLivre/backend/entity/`
- **Descrição:** Entidade JPA para persistência dos tokens temporários de redefinição de senha com controle de uso e expiração.

#### 9. Repositórios (`repository/`)
- [`UsuarioRepository.java`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/java/com/sementeLivre/backend/repository/UsuarioRepository.java)
- [`RoleRepository.java`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/java/com/sementeLivre/backend/repository/RoleRepository.java)
- [`RefreshTokenRepository.java`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/java/com/sementeLivre/backend/repository/RefreshTokenRepository.java)
- [`TokenRecuperacaoSenhaRepository.java`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/java/com/sementeLivre/backend/repository/TokenRecuperacaoSenhaRepository.java)
- **Descrição:** Interfaces Spring Data JPA estendendo a interface base do projeto `BaseRepository<T, ID>`, provendo buscas por e-mail, verificação de existência e gerenciamento de tokens.

#### 10. Camada de Segurança (`security/`)
- [`JwtService.java`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/java/com/sementeLivre/backend/security/JwtService.java): Utilitário de alta performance que assina e valida tokens JWT utilizando JJWT 0.12.5, incorporando claims como ID do usuário, nome e roles.
- [`UserDetailsServiceImpl.java`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/java/com/sementeLivre/backend/security/UserDetailsServiceImpl.java): Integração com o Spring Security para carregar o usuário pelo e-mail durante o processo de autenticação.
- [`SecurityFilter.java`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/java/com/sementeLivre/backend/security/SecurityFilter.java): Filtro HTTP `OncePerRequestFilter` que intercepta requisições, extrai o header `Authorization: Bearer <TOKEN>`, valida a assinatura e autoriza o acesso.
- [`SecurityConfig.java`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/java/com/sementeLivre/backend/security/SecurityConfig.java): Configura a esteira de segurança com sessão `STATELESS`, habilita o `BCryptPasswordEncoder`, libera as rotas públicas `/auth/**` e exige autenticação nas demais.

#### 11. Objetos de Transferência de Dados (`dto/`)
- [`CadastroRequestDTO.java`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/java/com/sementeLivre/backend/dto/CadastroRequestDTO.java): Entrada para criação de contas.
- [`LoginRequestDTO.java`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/java/com/sementeLivre/backend/dto/LoginRequestDTO.java): Entrada para login com e-mail e senha.
- [`RefreshTokenRequestDTO.java`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/java/com/sementeLivre/backend/dto/RefreshTokenRequestDTO.java): Entrada para geração de novo Access Token.
- [`SolicitarRecuperacaoDTO.java`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/java/com/sementeLivre/backend/dto/SolicitarRecuperacaoDTO.java): Entrada para solicitação de e-mail de recuperação.
- [`RedefinirSenhaDTO.java`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/java/com/sementeLivre/backend/dto/RedefinirSenhaDTO.java): Entrada com o token e a nova senha.
- [`TokenResponseDTO.java`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/java/com/sementeLivre/backend/dto/TokenResponseDTO.java): Saída contendo `accessToken`, `refreshToken`, `tokenType` ("Bearer") e tempo de expiração.
- [`UsuarioResponseDTO.java`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/java/com/sementeLivre/backend/dto/UsuarioResponseDTO.java): Saída com dados do usuário cadastrado (**sem expor campo de senha**).

#### 12. Regra de Negócio (`service/`)
- [`EmailService.java`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/java/com/sementeLivre/backend/service/EmailService.java): Serviço para envio de e-mails formatados contendo o token de redefinição de senha.
- [`AuthService.java`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/java/com/sementeLivre/backend/service/AuthService.java): Centraliza a lógica de cadastro (criptografia BCrypt + vinculação da `ROLE_USUARIO`), login via `AuthenticationManager`, renovação com rotação de refresh token e redefinição de senha.

#### 13. Controlador REST (`controller/`)
- [`AuthController.java`](file:///c:/Users/USUARIO/Documents/GitHub/SementeLivre/backend/src/main/java/com/sementeLivre/backend/controller/AuthController.java): Expõe os 5 endpoints no prefixo `/auth/` (`/cadastrar`, `/login`, `/refresh`, `/recuperar-senha`, `/redefinir-senha`).

---

## 3. Como Executar a Aplicação com o Banco de Dados

### Passo 1: Iniciar o Container do PostgreSQL
Na pasta `backend`, abra o terminal e execute:
```bash
docker compose up -d
```

### Passo 2: Executar a Aplicação Spring Boot
No **Windows**:
```cmd
mvnw.cmd spring-boot:run
```
No **Linux / macOS**:
```bash
./mvnw spring-boot:run
```

Ao iniciar, o **Flyway** executará automaticamente a migração `V2__criar_tabelas_autenticacao.sql` no PostgreSQL.

---

## 4. Guia Completo de Testes no Postman (Passo a Passo)

Abra o **Postman** e siga a sequência de testes abaixo.

---

### 🧪 Teste 1: Cadastrar Usuário (`POST /auth/cadastrar`)

- **Método:** `POST`
- **URL:** `http://localhost:8080/auth/cadastrar`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body (raw -> JSON):**
```json
{
  "nome": "Maria Souza",
  "email": "maria@semente.com",
  "senha": "senhaSegura123"
}
```
- **Resultado Esperado:** **HTTP Status `201 Created`**
- **Resposta:**
```json
{
  "id": "e3b0c442-98fc-4c14-9621-e73715c0e29b",
  "nome": "Maria Souza",
  "email": "maria@semente.com",
  "roles": [
    "ROLE_USUARIO"
  ]
}
```
> 🔒 **Verificação de Segurança:** Observe que a senha **não é retornada** no JSON de resposta. No banco PostgreSQL, ela é gravada criptografada com algoritmo **BCrypt**.

---

### 🧪 Teste 2: Realizar Login (`POST /auth/login`)

- **Método:** `POST`
- **URL:** `http://localhost:8080/auth/login`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body (raw -> JSON):**
```json
{
  "email": "maria@semente.com",
  "senha": "senhaSegura123"
}
```
- **Resultado Esperado:** **HTTP Status `200 OK`**
- **Resposta:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtYXJpYUBzZW1lbnRlLmNvbSIsImlkIjoiZW..."",
  "refreshToken": "a8f1b2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "tokenType": "Bearer",
  "expiresInSeconds": 1800
}
```
> 💡 Copie o `accessToken` e o `refreshToken` recebidos para usar nos próximos testes.

---

### 🧪 Teste 3: Acessar Rota Protegida com o Token (`Bearer Token`)

Tente acessar uma rota protegida (ex: `/comunidades`):

- **Método:** `GET`
- **URL:** `http://localhost:8080/comunidades`
- **Aba Authorization no Postman:**
  - Type: **Bearer Token**
  - Token: Cole o `accessToken` gerado no Teste 2.
- **Resultado Esperado:** **HTTP Status `200 OK`** (ou `204 No Content` se a lista estiver vazia).
- **Sem o Token:** Se tentar fazer a requisição sem o Header `Authorization`, o Spring Security retornará **HTTP Status `403 Forbidden`** ou **`401 Unauthorized`**.

---

### 🧪 Teste 4: Gerar Novo Access Token via Refresh Token (`POST /auth/refresh`)

Quando o `accessToken` expirar, o cliente pode solicitar um novo token enviando o `refreshToken`:

- **Método:** `POST`
- **URL:** `http://localhost:8080/auth/refresh`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body (raw -> JSON):**
```json
{
  "refreshToken": "a8f1b2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c"
}
```
- **Resultado Esperado:** **HTTP Status `200 OK`**
- **Resposta:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9.NUEVkX0Z...",
  "refreshToken": "f9e8d7c6-b5a4-3210-9876-543210fedcba",
  "tokenType": "Bearer",
  "expiresInSeconds": 1800
}
```
> 🔄 **Rotação de Refresh Token:** O refresh token antigo é revogado e um novo par é gerado.

---

### 🧪 Teste 5: Solicitar Recuperação de Senha (`POST /auth/recuperar-senha`)

- **Método:** `POST`
- **URL:** `http://localhost:8080/auth/recuperar-senha`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body (raw -> JSON):**
```json
{
  "email": "maria@semente.com"
}
```
- **Resultado Esperado:** **HTTP Status `200 OK`**
- **Resposta:**
```json
{
  "mensagem": "Se o e-mail estiver cadastrado, as instruções foram enviadas."
}
```
> 📌 **Verificando o Token no Banco:** Em ambiente de desenvolvimento local, você pode consultar o token gerado diretamente no PostgreSQL com o comando SQL:  
> `SELECT token FROM token_recuperacao_senha_t WHERE usado = false;`

---

### 🧪 Teste 6: Redefinir Senha (`POST /auth/redefinir-senha`)

- **Método:** `POST`
- **URL:** `http://localhost:8080/auth/redefinir-senha`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body (raw -> JSON):**
```json
{
  "token": "cole_o_token_consultado_no_banco_ou_email",
  "novaSenha": "novaSenhaSegura456"
}
```
- **Resultado Esperado:** **HTTP Status `200 OK`**
- **Resposta:**
```json
{
  "mensagem": "Senha redefinida com sucesso."
}
```

---

### 🧪 Teste 7: Confirmar Login com a Nova Senha

- **Método:** `POST`
- **URL:** `http://localhost:8080/auth/login`
- **Body (raw -> JSON):**
```json
{
  "email": "maria@semente.com",
  "senha": "novaSenhaSegura456"
}
```
- **Resultado Esperado:** **HTTP Status `200 OK`** com a devolução dos novos tokens válidos!

---

## 5. Verificação dos Critérios de Aceite

| Critério de Aceite | Status | Evidência de Implementação |
| :--- | :---: | :--- |
| **`POST /auth/login` retorna access + refresh token** | ✅ Concluído | `AuthController.login()` retorna `TokenResponseDTO` com ambos os tokens. |
| **`POST /auth/cadastrar` retorna 201 e salva com BCrypt** | ✅ Concluído | `AuthService.cadastrar()` usa `passwordEncoder.encode()` e o controller retorna HTTP `201`. |
| **Refresh token gera novo access token válido** | ✅ Concluído | Endpoint `POST /auth/refresh` valida token ativo e emite novos tokens com rotação. |
| **Recuperação de senha gera token/email de redefinição** | ✅ Concluído | `EmailService` e `token_recuperacao_senha_t` controlam expiração de 15 minutos e uso único. |
| **Token expira conforme tempo configurado** | ✅ Concluído | Parametrizado via `jwt.expiration` e `jwt.refresh-expiration-days` no `application-dev.yml`. |
| **Senha nunca reaparece em respostas/logs** | ✅ Concluído | Omitida de todos os DTOs de resposta e protegida com `@ToString.Exclude` na entidade `Usuario`. |
