# Semente Livre — Telas e Funcionalidades

> **Público-alvo:** Produtores rurais familiares, usuários leigos, acesso primário via smartphone Android  
> **Prioridade absoluta:** Acessibilidade, clareza visual, toques amplos (mínimo 44×44px), feedback sempre visível

---

## Convenções Globais

### Navegação Principal (Bottom Navigation)
Barra fixa no rodapé, presente em todas as telas do app (grupo `/app`):

| Ícone | Label | Rota | CDU |
|---|---|---|---|
| 🏠 Casa | Início | `/dashboard` | — |
| 🌱 Folha | Sementes | `/sementes` | CDU-11 |
| 📦 Caixa | Pedidos | `/pedidos` | CDU-12 |
| 🏡 Fazenda | Propriedades | `/propriedades` | CDU-16 |
| 👤 Pessoa | Perfil | `/perfil` | CDU-01 |

- Ícone ativo: cor `--color-primary` com indicador visual abaixo
- Labels sempre visíveis (acessibilidade para leigos)
- `aria-label` e `aria-current="page"` na rota ativa

### Header
- Altura: 56px, fundo branco, sombra sutil
- Título da página à esquerda (Poppins SemiBold 18px)
- Sino de notificações à direita com badge de contagem não lida
- Botão voltar (`←`) quando em sub-rotas

### Feedback Visual Padrão
- **Toast de sucesso:** fundo verde `--color-primary-light`, ícone ✓, `aria-live="polite"`
- **Toast de erro:** fundo `--color-danger-light`, ícone ✗, `aria-live="assertive"`
- **Loading:** Skeleton cinza animado (shimmer) — nunca spinner bloqueante em tela cheia
- **Estado vazio:** Ilustração simples + texto explicativo + botão de ação principal

---

## TELA 01 — Splash Screen / Inicialização
**Rota:** `/` (redireciona após 2s)  
**CDU:** —

### O que o usuário vê:
- Fundo branco
- Logo Semente Livre (folha verde + nome em Poppins Bold)
- Abaixo, logo menor do IF Sudeste MG
- Barra de progresso verde animada na base

### Comportamento:
- Verifica sessão ativa no Firebase Auth
- Se logado → redireciona para `/dashboard`
- Se não logado → redireciona para `/entrar`

### Acessibilidade:
- `aria-label="Carregando Semente Livre"` na tela
- `role="status"` na barra de progresso

---

## TELA 02 — Login
**Rota:** `/entrar`  
**CDU:** CDU-06

### O que o usuário vê:
- Logo e nome do app no topo (identidade visual)
- Campo "E-mail" com teclado tipo email
- Campo "Senha" com botão de mostrar/ocultar (olho)
- Botão grande "Entrar" (verde, largura total)
- Link "Esqueceu sua senha?" (sublinhado, cor primária)
- Link "Ainda não tem conta? Cadastre-se" na base

### Validações e Feedbacks:
- Email inválido: `aria-invalid="true"` + mensagem embaixo do campo
- Credenciais erradas: toast vermelho "E-mail ou senha incorretos"
- Sem conexão: toast laranja "Verifique sua conexão com a internet"
- Loading no botão durante o processo (spinner + texto "Entrando...")

### Acessibilidade:
- `<label>` explícito para cada campo
- `autocomplete="email"` e `autocomplete="current-password"`
- Foco automático no campo e-mail ao abrir a tela

---

## TELA 03 — Cadastro de Proprietário
**Rota:** `/cadastrar`  
**CDU:** CDU-15

### O que o usuário vê:
- Título "Criar conta" (h1)
- Formulário em seções com `<fieldset>`:
  - **Dados pessoais:** Nome completo*, CPF* (máscara), RG*, Telefone (máscara)
  - **Acesso:** E-mail*, Senha*, Confirmar Senha*
  - **Endereço:** CEP* (busca automática via ViaCEP), Logradouro, Número, Complemento, Bairro, Município, UF
- Botão "Cadastrar" (verde, largura total)
- Link "Já tenho conta" na base

### Validações:
- CPF: formato e dígito verificador + unicidade (Firestore)
- E-mail: formato + unicidade (Firebase Auth)
- Senha: mínimo 8 caracteres, 1 maiúscula, 1 número
- Confirmar Senha: igual ao campo Senha
- CEP: busca ViaCEP e preenche endereço automaticamente

### Acessibilidade:
- `inputmode="numeric"` em CPF, RG, CEP, Telefone
- `autocomplete` adequado em todos os campos
- Erros com `aria-describedby` linkado ao ID da mensagem de erro

---

## TELA 04 — Recuperação de Senha
**Rota:** `/recuperar-senha`  
**CDU:** CDU-07

### O que o usuário vê:
- Ícone de envelope (ilustração simples)
- Título "Recuperar senha"
- Texto explicativo: "Digite seu e-mail e enviaremos um link para criar uma nova senha."
- Campo "E-mail"
- Botão "Enviar link" (verde)
- Link "Voltar para o login"

### Comportamento:
- Firebase Auth `sendPasswordResetEmail`
- Sucesso: tela muda para confirmação "E-mail enviado! Verifique sua caixa de entrada." + botão voltar
- E-mail não encontrado: toast de erro (não revelar se e-mail existe — segurança)

---

## TELA 05 — Dashboard (Painel Inicial)
**Rota:** `/dashboard`  
**CDU:** CDU-18

### O que o usuário vê:
- Saudação personalizada: "Olá, [Nome]! 👋" (Poppins Medium 20px)
- Data e hora atual
- **Cards de resumo (2 colunas):**
  - 🌱 Total de sementes cadastradas (número grande verde)
  - 📦 Pedidos este mês
  - 🏡 Propriedades cadastradas
  - 🔔 Notificações não lidas
- **Seção "Sementes com Baixo Estoque":** lista horizontal com scroll de cards de alerta (quantidade ≤ 20% do cadastrado)
- **Atalhos Rápidos:** botões grandes ícone+texto
  - "Nova Semente" → `/sementes/nova`
  - "Novo Pedido" → `/pedidos/novo`

### Comportamento:
- Dados carregados em paralelo (Promise.all)
- Skeletons durante loading
- Sem dados: mensagem de boas-vindas + convite para cadastrar primeira semente

### Acessibilidade:
- Cards de resumo com `aria-label` descritivo ("Total de sementes: 12")
- Seção de alertas com `role="region"` e `aria-label="Sementes com baixo estoque"`

---

## TELA 06 — Listagem de Sementes (Estoque)
**Rota:** `/sementes`  
**CDU:** CDU-11, CDU-18

### O que o usuário vê:
- Header: título "Minhas Sementes" + botão "+" (nova semente)
- Barra de busca no topo (campo de texto com ícone lupa)
- **Filtros em chips horizontais com scroll:**
  - Disponibilidade: Todas | Para Venda | Para Troca | Para Doação | Indisponível
  - Tipo: Todas | Hortaliça | Frutífera | Forrageira | Cereal | Leguminosa
- **Lista de cards** (1 por linha, layout vertical):
  - Foto da semente (80×80px, arredondada)
  - Nome popular (Poppins SemiBold)
  - Nome científico (itálico, cinza)
  - Badge de disponibilidade (colorido)
  - Quantidade em estoque + unidade
  - Chevron `>` à direita

### Comportamento:
- Busca em tempo real (debounce 300ms) por nome popular e científico
- Filtros acumulativos (chip selecionado = destaque verde)
- Paginação: carregar mais ao rolar até o fim (infinite scroll simples)
- Estado vazio (sem sementes): ícone + "Você ainda não tem sementes cadastradas" + botão "Cadastrar primeira semente"
- Estado sem resultado de filtro: "Nenhuma semente encontrada para esse filtro."

### Cores dos Badges de Disponibilidade:
| Status | Cor de fundo | Cor de texto |
|---|---|---|
| Para Venda | `#e8f5eb` | `#2f9e41` |
| Para Troca | `#fff8e1` | `#f59e0b` |
| Para Doação | `#e3f2fd` | `#1976d2` |
| Indisponível | `#f5f5f5` | `#6b6b6b` |

---

## TELA 07 — Cadastrar Semente
**Rota:** `/sementes/nova`  
**CDU:** CDU-08, CDU-22

### O que o usuário vê:
- Formulário com seções (`<fieldset>` agrupadas):

**Seção "Foto":**
- Área quadrada de upload (tap para abrir câmera ou galeria)
- Preview da imagem selecionada
- Botão "Remover foto" se já tiver imagem

**Seção "Identificação":**
- Nome popular* (texto)
- Nome científico (texto, placeholder "Opcional")
- Histórico / Descrição (textarea)

**Seção "Classificação":**
- Tipo* (Select: Hortaliça, Frutífera, Forrageira, Cereal, Leguminosa, Outras)
- Espécie Geral* (Select: Feijão, Milho, Abóbora, Alface, Arroz, Cebola, Alho, Outras)
- Formato* (Toggle dois estados: "Semente" / "Muda")

**Seção "Estoque Inicial":**
- Quantidade* (número, `inputmode="decimal"`)
- Unidade de medida* (Select: Saca, kg, Grama, mg, Unidade)
- Disponibilidade* (Select: Para Venda, Para Troca, Para Doação, Indisponível)
- Preço (número, visível apenas se disponibilidade ≠ Indisponível)
- Forma de precificação (ex: "R$ 10,00/kg" — texto livre)

- Botão "Cadastrar Semente" (verde, largura total, fixo no rodapé acima do BottomNav)

### Validações:
- Campos obrigatórios (`*`) bloqueiam envio
- Foto obrigatória
- Quantidade não pode ser negativa
- Se quantidade = 0 → disponibilidade automaticamente "Indisponível" (com aviso)

---

## TELA 08 — Detalhe / Editar Semente
**Rota:** `/sementes/[id]`  
**CDU:** CDU-09, CDU-10, CDU-23, CDU-24

### O que o usuário vê:
- **Modo Visualização (padrão):**
  - Foto em destaque (largura total, height 200px)
  - Nome popular (h1 grande)
  - Nome científico (itálico)
  - Badge de disponibilidade
  - Grid de informações: Tipo, Espécie, Formato, Quantidade, Unidade, Preço
  - Histórico/descrição (expandível se longo)
  - Seção "Estoque" com quantidade atual + botões de ação:
    - "Ajustar Estoque" (abre modal)
    - "Ver Movimentações" (link para `/sementes/[id]/estoque`)
  - Botão "Editar" (flutuante, canto inferior direito) → alterna para modo edição
  - Botão "Excluir" (vermelho, texto)

- **Modo Edição:**
  - Mesmo formulário do cadastro, pré-preenchido
  - Botões: "Salvar Alterações" (verde) | "Cancelar" (cinza)

### Modal "Ajustar Estoque":
- Texto: "Estoque atual: X [unidade]"
- Toggle: "Adicionar" / "Subtrair"
- Campo: Quantidade a ajustar
- Motivo (Select: Entrada, Correção, Zeramento)
- Botão "Confirmar"

### Exclusão:
- Dialog de confirmação: "Tem certeza? A semente será removida, mas os pedidos anteriores serão mantidos."
- Botões: "Excluir" (vermelho) | "Cancelar"

---

## TELA 09 — Histórico de Movimentações do Estoque
**Rota:** `/sementes/[id]/estoque`  
**CDU:** CDU-18, CDU-23

### O que o usuário vê:
- Header com nome da semente
- Card de resumo: quantidade atual em destaque
- Lista cronológica de movimentações (mais recente primeiro):
  - Data e hora
  - Tipo de movimentação (badge colorido: Entrada verde, Saída vermelha, Correção cinza)
  - Quantidade com sinal (+ ou -)
  - Motivo/origem (ex: "Pedido #123 — Venda")

---

## TELA 10 — Listagem de Pedidos
**Rota:** `/pedidos`  
**CDU:** CDU-12

### O que o usuário vê:
- Header: "Pedidos" + botão "+" (novo pedido)
- **Filtros em chips:** Todos | Pendente | Confirmado | Cancelado
- **Filtros secundários (expandível):** Período, Tipo (Venda/Troca/Doação), Semente
- **Lista de cards:**
  - Número do pedido (#ID curto)
  - Data
  - Nome do recebedor
  - Tipo (badge: Venda azul, Troca amarelo, Doação roxo)
  - Status (badge)
  - Quantidade total de itens

### Comportamento:
- Estado vazio: "Nenhum pedido registrado ainda." + botão "Registrar Pedido"
- Toque no card → `/pedidos/[id]`

---

## TELA 11 — Registrar Novo Pedido
**Rota:** `/pedidos/novo`  
**CDU:** CDU-05 (RF-05), CDU-26

### O que o usuário vê:
**Seção "Recebedor":**
- Nome do recebedor*
- Contato (telefone ou e-mail)

**Seção "Tipo de Pedido":**
- Toggle 3 estados: "Venda" | "Troca" | "Doação"

**Seção "Itens":**
- Botão "Adicionar Semente"
- Lista de itens adicionados (card com: nome, quantidade, unidade, preço unitário se venda)
- Total calculado automaticamente (se venda)

**Modal "Adicionar Semente":**
- Busca por nome
- Lista de sementes disponíveis com quantidade em estoque
- Campo quantidade desejada (validado contra estoque)

**Seção "Observações":**
- Textarea opcional "Mensagem / observação"

- Botão "Registrar Pedido" (verde, fixo no rodapé)

### Comportamento pós-cadastro:
- Estoque atualizado automaticamente (CDU-23)
- Notificação gerada (CDU-26)
- Toast: "Pedido registrado com sucesso!"
- Redireciona para `/pedidos/[id]`

---

## TELA 12 — Detalhe / Editar Pedido
**Rota:** `/pedidos/[id]`  
**CDU:** CDU-13, CDU-14

### O que o usuário vê:
- **Modo Visualização:**
  - Status em destaque (badge grande)
  - Data e hora do pedido
  - Tipo do pedido
  - Dados do recebedor
  - Lista de itens (nome, quantidade, preço se venda)
  - Total (se venda)
  - Observações
  - Histórico de alterações (colapsável)
  - Botão "Editar" | Botão "Cancelar Pedido" (vermelho, apenas se PENDENTE)
  - Botão "Confirmar Pedido" (verde, apenas se PENDENTE)

- **Modo Edição:** formulário pré-preenchido, mesmo do cadastro

### Exclusão/Cancelamento:
- Dialog: "O estoque da semente será restaurado. Confirmar cancelamento?"

---

## TELA 13 — Listagem de Propriedades
**Rota:** `/propriedades`  
**CDU:** CDU-16

### O que o usuário vê:
- Header: "Minhas Propriedades" + botão "+"
- Lista de cards:
  - Nome da propriedade
  - Município / UF
  - Comunidade vinculada (badge)
  - Tamanho em hectares
  - Quantidade de sementes no estoque

### Estado vazio:
- "Você precisa cadastrar uma propriedade antes de adicionar sementes."
- Botão "Cadastrar Propriedade"

---

## TELA 14 — Cadastrar / Editar Propriedade
**Rota:** `/propriedades/nova` | `/propriedades/[id]`  
**CDU:** CDU-02, CDU-03, CDU-04, CDU-20, CDU-21

### O que o usuário vê:
- Nome da propriedade*
- Tamanho em hectares (número decimal)
- Endereço: CEP* (busca automática), Logradouro, Número, Complemento, Bairro, Município, UF
- **Campo Comunidade*:**
  - Select com busca
  - Opção "Minha comunidade não está na lista" → abre formulário de solicitação (CDU-21)

**Sub-fluxo Solicitar Comunidade (CDU-21):**
- Modal com campos: Nome da Comunidade*, Município*
- Aviso: "Sua solicitação será analisada. A propriedade ficará vinculada provisoriamente."
- Botão "Enviar Solicitação"

### Exclusão (apenas em modo edição):
- Verifica dependências (sementes em estoque)
- Se houver dependências: "Não é possível excluir — existem sementes vinculadas a esta propriedade." + lista das dependências
- Sem dependências: dialog de confirmação

---

## TELA 15 — Relatórios
**Rota:** `/relatorios`  
**CDU:** CDU-05, CDU-17, CDU-25

### O que o usuário vê:
**Passo 1 — Selecionar Tipo:**
- Card selecionável: "📊 Relatório de Estoque de Sementes"
- Card selecionável: "📋 Relatório de Pedidos"

**Passo 2 — Filtros (acordo com o tipo):**

*Estoque:*
- Disponibilidade (multiselect chips)
- Tipo de semente (multiselect chips)
- Comunidade (select)

*Pedidos:*
- Período: data início / data fim (date pickers nativos)
- Tipo de pedido (chips: Venda / Troca / Doação)
- Semente específica (select com busca)
- Status (chips)

**Passo 3 — Prévia:**
- Tabela com dados filtrados (scroll horizontal se necessário)
- Contagem: "X registros encontrados"
- Se vazio: "Nenhum dado para os filtros selecionados." (desabilita exportação)

**Ações de exportação:**
- Botão "Exportar PDF" (vermelho institucional)
- Botão "Exportar CSV" (cinza)
- Compartilhamento via Web Share API (nativo mobile)

---

## TELA 16 — Notificações
**Rota:** `/notificacoes`  
**CDU:** CDU-26 (RF-08)

### O que o usuário vê:
- Header: "Notificações" + botão "Marcar todas como lidas"
- Lista cronológica:
  - Ícone de tipo (🌱 semente, 📦 pedido)
  - Título da notificação (negrito se não lida)
  - Mensagem resumida
  - Data/hora (formato relativo: "há 2 horas")
  - Indicador visual de não lida (ponto verde à esquerda)

### Comportamento:
- Toque na notificação → marca como lida + navega para pedido relacionado
- Estado vazio: "Nenhuma notificação ainda."
- Notificações push via Firebase Cloud Messaging (quando app em background)

---

## TELA 17 — Perfil e Configurações
**Rota:** `/perfil`  
**CDU:** CDU-01, CDU-19

### O que o usuário vê:
- Avatar circular com inicial do nome (fundo verde)
- Nome completo (h1)
- E-mail (cinza)
- Seção "Dados Pessoais" (modo leitura, botão Editar):
  - Nome, CPF (mascarado), RG, Telefone
  - Endereço completo
- Seção "Endereço" (com botão Editar)
- Botão "Alterar Senha" → modal com campos: Senha atual, Nova senha, Confirmar nova senha
- Botão "Sair do Aplicativo" (vermelho, largura total)
- Versão do app e link "Sobre o Semente Livre"

### Modal Alterar Senha:
- Senha atual* (com toggle ver/ocultar)
- Nova senha* (com indicador de força: Fraca / Média / Forte)
- Confirmar nova senha*
- Botão "Salvar"

### Logout (CDU-19):
- Dialog: "Tem certeza que deseja sair?"
- Botões: "Sair" (vermelho) | "Cancelar"
- Pós-logout: invalida sessão → `/entrar`

---

## Estados de Erro Globais

### Sem Conexão (Offline)
- Banner amarelo no topo: "⚠️ Sem conexão. Suas alterações serão sincronizadas quando a internet voltar."
- `aria-live="assertive"` no banner
- Operações de leitura: mostram dados do cache do Firestore
- Operações de escrita: enfileiradas para sincronização automática

### Erro de Servidor
- Toast vermelho: "Ocorreu um erro inesperado. Tente novamente."
- Botão "Tentar novamente" no estado de erro de lista

### Sessão Expirada
- Middleware redireciona para `/entrar` com query param `?expired=1`
- Toast informativo: "Sua sessão expirou. Faça login novamente."
