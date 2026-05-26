# Semente Livre — Tarefas de Desenvolvimento (Dev Tasks)

> **Para a IA da IDE:** Execute as tarefas nesta ordem. Cada fase depende da anterior.  
> Leia também `specs/01-architecture.md` e `specs/02-screens-and-features.md` antes de começar.  
> Stack: Next.js 15 · TypeScript · CSS Modules · Firebase · Poppins · Paleta IF Sudeste MG

---

## FASE 0 — Configuração Base

### TASK-001 — Instalar dependências
```bash
npm install firebase react-hook-form zod @hookform/resolvers jspdf jspdf-autotable papaparse clsx next-pwa
npm install -D @types/papaparse
```

### TASK-002 — Configurar variáveis de ambiente
Criar arquivo `.env.local` na raiz do projeto com as chaves do Firebase:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```
Criar `.env.local.example` com os mesmos campos (sem valores) e commitar.

### TASK-003 — Configurar PWA no `next.config.ts`
Envolver a config com `withPWA` do `next-pwa`:
- `dest: 'public'`
- Desabilitar em `dev` (`disable: process.env.NODE_ENV === 'development'`)
- Estratégia de cache para imagens e fontes

### TASK-004 — Criar `public/manifest.json`
Conforme especificado em `specs/01-architecture.md`, seção 7.  
Ícones: verde `#2f9e41`, nome "Semente Livre", `display: "standalone"`, orientação portrait.

### TASK-005 — Criar `public/icons/`
Criar ícones PWA nos tamanhos 192×192, 512×512 e maskable (fundo verde com folha branca).

### TASK-006 — Configurar `src/app/globals.css`
Implementar **todos** os tokens de design conforme seção 4 de `specs/01-architecture.md`:
- Variáveis de cor, tipografia, espaçamento, bordas, sombras, layout, transições e acessibilidade
- Reset CSS minimalista (`*, box-sizing: border-box; margin: 0; padding: 0`)
- Import da fonte Poppins via Google Fonts (weights: 400, 500, 600, 700)
- `body { font-family: var(--font-family); color: var(--color-black); }`
- Estilo global de `:focus-visible { outline: var(--focus-ring); }`

### TASK-007 — Criar tipos TypeScript em `src/types/`
Criar os arquivos conforme mapeamento do diagrama de classes:
- `user.ts` → `Pessoa`, `Proprietario`, `Logradouro`
- `seed.ts` → `Produto`, `TipoProduto` (enum), `EspecieGeral` (enum), `FormatoProduto` (enum)
- `stock.ts` → `Estoque`, `Pesagem` (enum), `DisponibilidadeProduto` (enum), `TipoMovimentacao` (enum)
- `order.ts` → `Pedido`, `ItemPedido`, `TipoPedido` (enum), `StatusPedido` (enum)
- `property.ts` → `Propriedade`, `Comunidade`, `StatusComunidade` (enum)
- `notification.ts` → `Notificacao`
- `report.ts` → `Relatorio`, `TipoRelatorio` (enum)

### TASK-008 — Inicializar Firebase em `src/lib/firebase.ts`
- `initializeApp` com variáveis de ambiente
- Exportar `db` (Firestore), `auth` (Auth), `storage` (Storage)
- Habilitar persistência offline do Firestore: `enableIndexedDbPersistence(db)`

---

## FASE 1 — Componentes UI Base

### TASK-009 — Criar componentes `/components/ui/`
Implementar os seguintes componentes base com CSS Modules e full acessibilidade ARIA:

**Button** (`button.tsx` + `button.module.css`)
- Props: `variant` (primary | secondary | danger | ghost), `size` (sm | md | lg), `loading`, `disabled`, `fullWidth`
- Estado `loading`: spinner animado + texto "Carregando..." para screen readers
- `min-height: 44px` obrigatório em todos os tamanhos
- Hover: escurece 10%, Active: escurece 20%, Disabled: opacidade 50%

**Input** (`input.tsx` + `input.module.css`)
- Props: `label`, `error`, `hint`, `leftIcon`, `rightIcon`, `required`
- Sempre renderizar `<label>` associado via `htmlFor`
- Estado de erro: borda `--color-danger` + mensagem com `aria-describedby`
- `aria-invalid` automático quando há `error`
- `min-height: 44px`

**Label** (`label.tsx`)
- Asterisco vermelho para campos `required`
- `aria-hidden="true"` no asterisco (o `required` no input já indica)

**Select** (`select.tsx` + `select.module.css`)
- Nativo `<select>` estilizado (melhor acessibilidade mobile que custom)
- Mesmo comportamento de erro do Input
- Chevron customizado via CSS

**Toggle** (`toggle.tsx` + `toggle.module.css`)
- Props: `options: string[]` (2 ou 3 opções), `value`, `onChange`
- `role="radiogroup"`, cada opção com `role="radio"` e `aria-checked`
- Opção ativa: fundo verde, texto branco

**Badge** (`badge.tsx` + `badge.module.css`)
- Props: `variant` (availability | status | type), `value` (enum value)
- Mapeamento automático: `PARA_VENDA` → "Para Venda" (label), cor correspondente

**Card** (`card.tsx` + `card.module.css`)
- Container com sombra, borda arredondada, padding interno

**Dialog** (`dialog.tsx` + `dialog.module.css`)
- Modal acessível: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Focus trap quando aberto
- Fechar via botão X, Esc, ou clique no overlay
- Animação de entrada (slide-up no mobile)

**Textarea** (`textarea.tsx` + `textarea.module.css`)
- Mesmo padrão do Input, `resize: vertical` apenas

**Spinner** (`spinner.tsx`)
- SVG animado, `role="status"`, `aria-label="Carregando"`

### TASK-010 — Criar componentes de Layout em `/components/layout/`

**Header** (`Header.tsx` + `Header.module.css`)
- Props: `title`, `showBack` (boolean), `actions` (ReactNode)
- Botão voltar: `aria-label="Voltar"`, navega com `router.back()`
- Sino de notificações: badge com contagem não lida (ponto vermelho se > 0)
- `position: sticky; top: 0; z-index: 100`
- Altura: `var(--header-height)` = 56px

**BottomNavigation** (`BottomNavigation.tsx` + `BottomNavigation.module.css`)
- 5 abas: Início, Sementes, Pedidos, Propriedades, Perfil
- `<nav aria-label="Navegação principal">`
- `role="tablist"` nas abas, `aria-selected` na aba ativa
- `position: fixed; bottom: 0; width: 100%; z-index: 100`
- Altura: `var(--bottom-nav-height)` = 64px
- Linha indicadora animada acima do ícone ativo

**PageWrapper** (`PageWrapper.tsx` + `PageWrapper.module.css`)
- `<main>` com `padding-top: var(--header-height)` e `padding-bottom: var(--bottom-nav-height)`
- `max-width: var(--max-content-width)` centrado
- Padding lateral: `var(--content-padding)`

### TASK-011 — Criar componentes de Feedback em `/components/feedback/`

**EmptyState** (`EmptyState.tsx` + `EmptyState.module.css`)
- Props: `icon`, `title`, `description`, `actionLabel`, `onAction`
- Centralizado, ícone grande (emoji ou SVG), texto descritivo, botão opcional

**LoadingState** (`LoadingState.tsx`)
- Skeleton shimmer animado
- Props: `type` (list | card | form) para diferentes layouts de skeleton

**Toast** (`Toast.tsx` + `Toast.module.css`)
- Props: `type` (success | error | warning | info), `message`, `duration`
- `aria-live="polite"` para success/info, `aria-live="assertive"` para error
- Posição: topo da tela (abaixo do header), slide-down animado
- Auto-dismiss após `duration` (padrão 4000ms)

---

## FASE 2 — Autenticação e Contextos

### TASK-012 — Criar `src/context/AuthContext.tsx`
- `AuthProvider` com `onAuthStateChanged` do Firebase
- Estado: `user: Proprietario | null`, `loading: boolean`
- Hook `useAuth()` exportado
- Persistência da sessão: `setPersistence(auth, browserLocalPersistence)`
- Timer de inatividade: 30 min sem interação → `signOut()` automático

### TASK-013 — Criar `src/context/NotificationContext.tsx`
- Contagem de notificações não lidas em tempo real (Firestore `onSnapshot`)
- Hook `useNotifications()` com: `unreadCount`, `notifications`, `markAsRead(id)`, `markAllAsRead()`

### TASK-014 — Criar `src/middleware.ts`
- Proteger todas as rotas do grupo `(app)/`
- Se não autenticado → redirecionar para `/entrar`
- Se autenticado em rota `(auth)/` → redirecionar para `/dashboard`
- Usar cookie de sessão do Firebase Auth

### TASK-015 — Criar layouts de grupo de rotas

**`src/app/(auth)/layout.tsx`**
- Layout simples: fundo branco, sem header/bottom-nav
- Logo no topo
- Scroll vertical livre

**`src/app/(app)/layout.tsx`**
- Envolver com `AuthProvider` e `NotificationProvider`
- Renderizar `<Header>` e `<BottomNavigation>`
- `<PageWrapper>` como container do `{children}`

### TASK-016 — Criar `src/app/layout.tsx` (Root Layout)
- Import da fonte Poppins (Google Fonts via `next/font/google`)
- Metadata: título "Semente Livre", description, theme-color `#2f9e41`
- Link para `manifest.json`
- Meta viewport: `width=device-width, initial-scale=1`

---

## FASE 3 — Telas de Autenticação

### TASK-017 — Tela de Login (`/entrar/page.tsx`)
Conforme `specs/02-screens-and-features.md` — TELA 02.
- `useForm` + Zod schema: email (required, format), senha (required, min 6)
- `signInWithEmailAndPassword` do Firebase Auth
- Loading state no botão durante auth
- Toast de erro por tipo de FirebaseError
- Redireciona para `/dashboard` após login

### TASK-018 — Tela de Cadastro (`/cadastrar/page.tsx`)
Conforme TELA 03.
- Formulário multi-seção com `<fieldset>` e `<legend>`
- Busca de CEP via `fetch('https://viacep.com.br/ws/${cep}/json/')` — auto-preenche endereço
- Validação de CPF (algoritmo completo) via Zod custom refinement
- `createUserWithEmailAndPassword` + salvar dados em Firestore `proprietarios/{uid}`
- Senha: min 8 chars, 1 maiúscula, 1 número

### TASK-019 — Tela de Recuperação de Senha (`/recuperar-senha/page.tsx`)
Conforme TELA 04.
- `sendPasswordResetEmail` do Firebase
- Após envio: substituir formulário por tela de confirmação

---

## FASE 4 — Hooks de Dados (Firestore)

### TASK-020 — `src/hooks/useSeeds.ts`
```typescript
// Exportar:
useSeeds(proprietarioId: string) → { seeds, loading, error }
useSeed(id: string) → { seed, loading, error }
createSeed(data: Omit<Produto, 'id'>) → Promise<string>
updateSeed(id: string, data: Partial<Produto>) → Promise<void>
deleteSeed(id: string) → Promise<void>
uploadSeedPhoto(file: File) → Promise<string> // Firebase Storage
```
- Query: `collection(db, 'estoques')` filtrado por `idProprietario`
- Real-time com `onSnapshot`

### TASK-021 — `src/hooks/useOrders.ts`
```typescript
useOrders(proprietarioId: string) → { orders, loading, error }
useOrder(id: string) → { order, loading, error }
createOrder(data) → Promise<string>   // + CDU-23 atualiza estoque + CDU-26 notificação
updateOrder(id, data) → Promise<void> // + recalcula estoque
cancelOrder(id) → Promise<void>       // + restaura estoque
```

### TASK-022 — `src/hooks/useProperties.ts`
```typescript
useProperties(proprietarioId: string) → { properties, loading, error }
createProperty(data) → Promise<string>
updateProperty(id, data) → Promise<void>
deleteProperty(id) → Promise<void>  // verifica dependências antes
```
- Busca comunidades disponíveis: `useActiveCommunities()` (coleção `comunidades` com status ATIVA)

### TASK-023 — `src/hooks/useReports.ts`
```typescript
generateStockReport(filters) → Promise<RelatorioData>
generateOrdersReport(filters) → Promise<RelatorioData>
exportToPDF(data, type) → void  // jsPDF + jspdf-autotable
exportToCSV(data) → void        // PapaParse
```

### TASK-024 — `src/hooks/useOffline.ts`
```typescript
useOffline() → { isOffline: boolean }
// navigator.onLine + eventos 'online'/'offline'
```

---

## FASE 5 — Componentes de Domínio

### TASK-025 — Criar `SeedCard` (`/components/cards/SeedCard.tsx`)
Exibir: foto (80px quadrada, `object-fit: cover`), nome popular, nome científico (itálico), badge de disponibilidade, quantidade + unidade.  
`<article>` com `aria-label="Semente [nome]"`.

### TASK-026 — Criar `OrderCard` (`/components/cards/OrderCard.tsx`)
Exibir: número do pedido, data, nome do recebedor, tipo (badge), status (badge).

### TASK-027 — Criar `PropertyCard` (`/components/cards/PropertyCard.tsx`)
Exibir: nome, município/UF, comunidade (badge), hectares.

### TASK-028 — Criar `FilterBar` (`/components/shared/FilterBar.tsx`)
- Props: `filters: FilterOption[]`, `active: string`, `onChange`
- Chips horizontais com scroll, sem quebra de linha
- Chip ativo: fundo verde, texto branco, `aria-pressed="true"`
- `role="group"`, `aria-label="Filtrar por"`

### TASK-029 — Criar `ConfirmDialog` (`/components/shared/ConfirmDialog.tsx`)
- Props: `isOpen`, `title`, `description`, `confirmLabel`, `confirmVariant`, `onConfirm`, `onCancel`
- Usar componente `Dialog` base
- Foco automático no botão de cancelar (seguro por padrão)

### TASK-030 — Criar formulários de domínio em `/components/forms/`

**SeedForm.tsx** — campos conforme TELA 07
- Upload de foto: `<input type="file" accept="image/*" capture="environment">` (câmera mobile)
- Preview da imagem antes do upload
- Campo preço condicional (aparece apenas se disponibilidade ≠ INDISPONIVEL)

**OrderForm.tsx** — campos conforme TELA 11
- Modal interno para selecionar sementes
- Cálculo de total em tempo real

**PropertyForm.tsx** — campos conforme TELA 14
- Busca de CEP integrada
- Select de comunidade com opção "solicitar nova"
- Sub-formulário de solicitação de comunidade (CDU-21)

**ProfileForm.tsx** — campos conforme TELA 17
- Modo visualização / edição alternado
- Modal de alteração de senha separado

---

## FASE 6 — Páginas do App

### TASK-031 — Dashboard (`/dashboard/page.tsx`)
Conforme TELA 05.
- `Promise.all` para carregar contadores em paralelo
- 4 cards de resumo em grid 2×2
- Seção de alertas de baixo estoque (quantidade ≤ threshold)
- 2 botões de atalho rápido
- Skeletons durante loading

### TASK-032 — Listagem de Sementes (`/sementes/page.tsx`)
Conforme TELA 06.
- `useSeeds(user.uid)`
- Busca com `useMemo` + debounce
- Filtros por disponibilidade e tipo
- Infinite scroll (Intersection Observer)
- Link para `/sementes/nova` e `/sementes/[id]`

### TASK-033 — Cadastrar Semente (`/sementes/nova/page.tsx`)
Conforme TELA 07.
- `SeedForm` + `useSeeds().createSeed`
- Upload de foto com preview
- Botão fixo no rodapé (acima do BottomNav)
- Após cadastro: redireciona para `/sementes`

### TASK-034 — Detalhe/Editar Semente (`/sementes/[id]/page.tsx`)
Conforme TELA 08.
- `useSeed(id)`
- Toggle modo visualização ↔ edição
- Modal de ajuste de estoque
- Dialog de exclusão

### TASK-035 — Histórico de Estoque (`/sementes/[id]/estoque/page.tsx`)
Conforme TELA 09.
- Listar movimentações da coleção `estoques` com `where('idProduto', '==', id)` ordenado por data desc
- Badges coloridos por tipo de movimentação

### TASK-036 — Listagem de Pedidos (`/pedidos/page.tsx`)
Conforme TELA 10.
- `useOrders(user.uid)`
- Filtros de status em chips
- Filtros avançados colapsáveis (período, tipo, semente)

### TASK-037 — Registrar Pedido (`/pedidos/novo/page.tsx`)
Conforme TELA 11.
- `OrderForm` + `useOrders().createOrder`
- Seletor de sementes com verificação de estoque disponível
- Cálculo automático do total

### TASK-038 — Detalhe/Editar Pedido (`/pedidos/[id]/page.tsx`)
Conforme TELA 12.
- Ações condicionais por status (confirmar/cancelar apenas se PENDENTE)
- Dialog de cancelamento com aviso de restauração de estoque

### TASK-039 — Listagem de Propriedades (`/propriedades/page.tsx`)
Conforme TELA 13.

### TASK-040 — Cadastrar/Editar Propriedade (`/propriedades/nova/page.tsx` e `/propriedades/[id]/page.tsx`)
Conforme TELA 14.
- CDU-20: select de comunidade com busca
- CDU-21: sub-formulário de solicitação de nova comunidade

### TASK-041 — Relatórios (`/relatorios/page.tsx`)
Conforme TELA 15.
- Stepper visual: 1. Tipo → 2. Filtros → 3. Prévia + Exportar
- `useReports()` para processar dados
- `exportToPDF()` e `exportToCSV()` com Web Share API

### TASK-042 — Notificações (`/notificacoes/page.tsx`)
Conforme TELA 16.
- `useNotifications()` em real-time
- Toque: `markAsRead(id)` + navegar para pedido
- Botão "Marcar todas como lidas": `markAllAsRead()`

### TASK-043 — Perfil (`/perfil/page.tsx`)
Conforme TELA 17.
- Seções colapsáveis de edição
- Modal de alteração de senha com validação
- Logout com dialog de confirmação

---

## FASE 7 — Funcionalidades Avançadas

### TASK-044 — Banner de Offline
Criar componente `OfflineBanner` em `/components/shared/OfflineBanner.tsx`:
- `useOffline()` hook
- Banner amarelo no topo da página quando `isOffline === true`
- `aria-live="assertive"`, `role="alert"`
- Animação de slide-down

### TASK-045 — Notificações Push (Firebase Cloud Messaging)
- Configurar FCM no `firebase.ts`
- Pedir permissão após login: `Notification.requestPermission()`
- Service Worker handler para mensagens em background
- Salvar token FCM no documento do proprietário no Firestore

### TASK-046 — Gerar Relatório PDF com jsPDF
Em `src/lib/pdf.ts`:
- Header do PDF: logo IF, título do relatório, data de geração, filtros aplicados
- Tabela com `jspdf-autotable`
- Cores institucionais na tabela (cabeçalho verde `#2f9e41`)
- Footer: nome do proprietário, página X/Y

### TASK-047 — Gerar Relatório CSV com PapaParse
Em `src/lib/csv.ts`:
- `Papa.unparse(data)` com headers em português
- Compartilhar via `navigator.share()` se disponível (mobile)
- Fallback: `download` via `<a>` tag

### TASK-048 — Validação de CPF (Zod)
Em `src/lib/validators.ts`:
```typescript
export const cpfSchema = z.string().refine(validateCPF, { message: "CPF inválido" });
// Implementar algoritmo completo de verificação de dígitos
```

### TASK-049 — Busca de CEP (ViaCEP)
Em `src/lib/validators.ts` ou hook separado `useCEP`:
```typescript
async function fetchCEP(cep: string): Promise<Logradouro | null>
// fetch para https://viacep.com.br/ws/${cep}/json/
// Retornar null se CEP inválido ou não encontrado
```

---

## FASE 8 — Acessibilidade e Qualidade

### TASK-050 — Auditoria de Acessibilidade
Verificar em todas as telas:
- [ ] Todos os `<img>` têm `alt` descritivo
- [ ] Todos os campos têm `<label>` associado
- [ ] Todos os botões de ícone têm `aria-label`
- [ ] Mensagens de erro com `aria-describedby`
- [ ] Toasts com `aria-live`
- [ ] Modais com `role="dialog"` e focus trap
- [ ] Bottom Navigation com `role="tablist"`
- [ ] `tabIndex` lógico e sem "buracos"
- [ ] `min-height: 44px` em todos os elementos interativos
- [ ] Contraste mínimo de 4.5:1 em todos os textos

### TASK-051 — SEO e Metadata
Em cada `page.tsx`, exportar `metadata`:
```typescript
export const metadata: Metadata = {
  title: 'Sementes | Semente Livre',
  description: 'Gerencie seu banco de sementes crioulas',
};
```

### TASK-052 — Performance de Imagens
- Usar `<Image>` do Next.js em todas as imagens
- Configurar domínios do Firebase Storage em `next.config.ts`
- `sizes` e `priority` corretos para imagens above-the-fold

### TASK-053 — Responsividade Final
Testar e ajustar em:
- 360×800px (Android básico — mínimo suportado)
- 390×844px (iPhone 14)
- 412×915px (Pixel 6)
- 768×1024px (tablet — layout deve continuar funcional, centralizado)

---

## FASE 9 — Testes e Build

### TASK-054 — Testes manuais por CDU
| CDU | Teste | Resultado esperado |
|---|---|---|
| CDU-06 | Login com credenciais válidas | Redirecionar para /dashboard |
| CDU-06 | Login com credenciais inválidas | Toast de erro específico |
| CDU-15 | Cadastro com CPF duplicado | Erro de CPF já cadastrado |
| CDU-08 | Cadastrar semente sem foto | Bloquear com mensagem de erro |
| CDU-22 | Cadastrar semente com qtd 0 | Disponibilidade = Indisponível |
| CDU-05/17 | Gerar relatório sem dados | Desabilitar botão de exportar |
| CDU-19 | Logout | Invalida sessão, vai para /entrar |
| CDU-04 | Excluir propriedade com dependências | Bloquear com lista de dependências |
| CDU-26 | Registrar pedido | Notificação gerada + estoque atualizado |
| — | Abrir app offline | Banner de offline + dados do cache |

### TASK-055 — Build de produção
```bash
npm run build
npm run start
```
Verificar:
- Nenhum erro de TypeScript (`tsc --noEmit`)
- Nenhum erro de ESLint
- Lighthouse PWA score ≥ 90
- Lighthouse Accessibility score ≥ 90

### TASK-056 — Configurar `next.config.ts` para Firebase Storage
```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'firebasestorage.googleapis.com' }
  ]
}
```

---

## Ordem de Entrega Resumida

```
FASE 0 (Tasks 001-008)  → Configuração e tipos
FASE 1 (Tasks 009-011)  → Componentes UI base
FASE 2 (Tasks 012-016)  → Auth e contextos
FASE 3 (Tasks 017-019)  → Telas de autenticação
FASE 4 (Tasks 020-024)  → Hooks de dados
FASE 5 (Tasks 025-030)  → Componentes de domínio
FASE 6 (Tasks 031-043)  → Páginas do app
FASE 7 (Tasks 044-049)  → Funcionalidades avançadas
FASE 8 (Tasks 050-053)  → Acessibilidade e qualidade
FASE 9 (Tasks 054-056)  → Testes e build
```

> **Regra de ouro para a IA:** Nunca pular uma fase. Cada componente criado deve ser imediatamente usável e acessível. Nenhuma tela deve ser entregue sem estados de loading, erro e vazio implementados.
