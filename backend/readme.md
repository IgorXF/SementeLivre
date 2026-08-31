# Semente Livre - Backend

## 1. Descrição do Projeto
Este é o serviço de backend do sistema Semente Livre. A aplicação foi construída como uma API RESTful utilizando Spring Boot e gerencia a persistência de dados em um banco PostgreSQL rodando em container. O controle de versionamento das tabelas do banco de dados é automatizado através do Flyway.

## 2. Tecnologias Utilizadas
- **Java 17**
- **Spring Boot 4.1.1**
- **Maven Wrapper** (Gerenciamento de dependências integrado)
- **PostgreSQL 15**
- **Spring Data JPA** (Persistência de dados via Hibernate)
- **Flyway** (Versionamento de banco de dados)
- **Docker e Docker Compose**
- **Lombok** (Redução de código boilerplate)
- **Bean Validation** (Validação de dados de entrada)

## 3. Pré-requisitos
Para rodar este projeto na sua máquina, você precisará ter instalado:
- **Java 17** ou superior.
- **Docker** (O Docker Desktop já inclui o Docker Compose nativamente).

> **Nota:** O projeto utiliza o Maven Wrapper (`mvnw` / `mvnw.cmd`). Portanto, não é necessário instalar o Maven separadamente no seu sistema operacional. O próprio script se encarrega de baixar e usar a versão correta da ferramenta.

## 4. Como executar o projeto

A execução do projeto é dividida em duas etapas: subir a infraestrutura (banco de dados) e rodar a aplicação.

**Passo 1: Subir o Banco de Dados**

Na raiz da pasta `backend`, abra o terminal e execute:
```bash
docker compose up -d
```
Esse comando fará o download da imagem do PostgreSQL 15 e iniciará o container em segundo plano.

**Passo 2: Iniciar o Spring Boot**

Com o banco rodando, inicie a aplicação através do Maven Wrapper:

- No **Linux / macOS**:
  ```bash
  ./mvnw spring-boot:run
  ```
- No **Windows**:
  ```cmd
  mvnw.cmd spring-boot:run
  ```
    > **Nota para Windows:** Se você já tiver o Maven instalado globalmente na sua máquina, também pode usar simplesmente `mvn spring-boot:run`. Caso contrário, utilize o `mvnw.cmd spring-boot:run` para que o script baixe o Maven automaticamente.

## 5. Configuração do Banco de Dados
O banco de dados roda de forma isolada no Docker. As credenciais de acesso local (usuário, senha e banco) estão definidas no arquivo docker-compose.yml.
O Spring Boot já está configurado para se conectar automaticamente a ele utilizando o profile dev. Se precisar acessar o banco via DBeaver ou DataGrip, utilize a porta 5433 (mapeada no localhost) e as credenciais descritas no compose.

## 6. Profiles de Ambiente (dev / prod)
A aplicação está configurada para separar as propriedades de desenvolvimento e produção. O profile padrão ativo ao rodar o projeto localmente é o `dev`.

- `application-dev.yml`: Configurações exclusivas da máquina local (conecta ao container Docker e exibe logs SQL).
- `application-prod.yml`: Configurações para o servidor de produção (receberá variáveis de ambiente no deploy).

Se for necessário testar ou forçar a execução de um profile específico via terminal, utilize:
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod
```

## 7. Versionamento do Banco (Flyway)
As migrações do banco de dados (criação e alteração de tabelas) são gerenciadas pelo Flyway. Os scripts SQL estão localizados no diretório:
`src/main/resources/db/migration/`

A migração base do projeto é o arquivo `V1__init.sql`. Ao iniciar o Spring Boot, o Flyway detecta automaticamente novos arquivos nesse diretório e os executa no PostgreSQL na ordem correta.

## 8. Como verificar se está funcionando

- **Docker:** Para garantir que o banco subiu, execute `docker ps` e procure pelo container `semente_livre_db`.
- **Spring Boot:** O terminal da aplicação deve exibir a mensagem `Started BackendApplication in X seconds` sem erros em vermelho.
- **Tabelas (Flyway):** Para confirmar que a migração ocorreu, você pode entrar no container e listar as tabelas:
  ```bash
  docker exec -it semente_livre_db psql -U devuser -d devdb
  \dt
  ```
  Isso deve listar a sua tabela de teste e a tabela automática `flyway_schema_history`.

## 9. Estrutura do Projeto
Uma visão geral da organização dos arquivos de configuração e código fonte:

```text
backend/
├── .mvn/                        # Configurações do Maven Wrapper
├── src/
│   ├── main/
│   │   ├── java/                # Código fonte Java
│   │   └── resources/
│   │       ├── db/migration/    # Scripts SQL do Flyway (ex: V1__init.sql)
│   │       ├── application.yml        # Configuração mestre (define o profile ativo)
│   │       ├── application-dev.yml    # Configurações locais (Docker)
│   │       └── application-prod.yml   # Configurações de nuvem/servidor
├── docker-compose.yml           # Receita da infraestrutura do PostgreSQL
├── mvnw                         # Script do Maven para Linux/Mac
├── mvnw.cmd                     # Script do Maven para Windows
├── pom.xml                      # Dependências do projeto
└── README.md                    # Documentação do projeto
```