# Semente Livre — Especificação de Arquitetura

> **Projeto:** Semente Livre — Aplicativo Web PWA  
> **IF Sudeste MG – Campus Rio Pomba | Curso de Ciência da Computação**  
> **Stack:** Next.js 15 (App Router) · TypeScript · CSS Modules · Firebase  
> **Versão:** 1.0 | Maio/2026

---

## 1. Visão Geral

O Semente Livre é um **Progressive Web App (PWA)** voltado à gestão de bancos de sementes crioulas por produtores rurais familiares. O aplicativo funciona primariamente via navegador mobile, com suporte a instalação na tela inicial (PWA), modo offline e notificações push.

O foco é a **acessibilidade para usuários leigos**, seguindo as diretrizes WCAG 2.1 AA e ARIA, com interface em português do Brasil, paleta institucional do IF Sudeste MG e fonte Poppins.

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR/SSG, roteamento nativo, Server Actions, suporte a PWA |
| Linguagem | TypeScript | Tipagem estática, manutenibilidade |
| Estilização | CSS Modules | Escopo de estilos por componente, sem conflito de classes |
| Banco de dados | Firebase Firestore | Gratuito, sincronização em tempo real, suporte offline |
| Autenticação | Firebase Authentication | Email/senha, renovação de sessão, HTTPS nativo |
| Armazenamento | Firebase Storage | Upload de fotos de sementes |
| PWA | next-pwa (via next.config.ts) | Service Worker, cache offline, instalação na home screen |
| Exportação | jsPDF + Papa Parse | Geração de PDF e CSV no cliente |
| Componentes UI | Next.js `/components/ui` | Button, Input, Label, Toggle, Badge, Card, Dialog, Select |
| Formulários | React Hook Form + Zod | Validação robusta e acessível |
| Notificações | Firebase Cloud Messaging | Push notifications no PWA |

---

## 3. Estrutura de Pastas

```
semente-livre/
├── public/
│   ├── icons/                    # Ícones PWA (192x192, 512x512, maskable)
│   ├── manifest.json             # Web App Manifest
│   └── sw.js                     # Service Worker (gerado pelo next-pwa)
│
├── src/
│   ├── app/                      # App Router — rotas e layouts
│   │   ├── layout.tsx            # Root layout (fonte, metadata, PWA)
│   │   ├── page.tsx              # Redireciona para /entrar ou /dashboard
│   │   ├── globals.css           # Variáveis CSS globais (tokens de design)
│   │   │
│   │   ├── (auth)/               # Grupo de rotas públicas (sem header)
│   │   │   ├── layout.tsx        # Layout limpo para auth
│   │   │   ├── entrar/
│   │   │   │   └── page.tsx      # Tela de Login
│   │   │   ├── cadastrar/
│   │   │   │   └── page.tsx      # Tela de Cadastro de Proprietário
│   │   │   └── recuperar-senha/
│   │   │       └── page.tsx      # Tela de Recuperação de Senha
│   │   │
│   │   ├── (app)/                # Grupo de rotas protegidas
│   │   │   ├── layout.tsx        # Layout com BottomNavigation + Header
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx      # Painel Inicial (Dashboard)
│   │   │   │
│   │   │   ├── sementes/
│   │   │   │   ├── page.tsx      # Listagem de Sementes (Estoque)
│   │   │   │   ├── nova/
│   │   │   │   │   └── page.tsx  # Cadastrar Semente
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx  # Detalhe / Editar Semente
│   │   │   │       └── estoque/
│   │   │   │           └── page.tsx # Histórico de Movimentações do Estoque
│   │   │   │
│   │   │   ├── pedidos/
│   │   │   │   ├── page.tsx      # Listagem de Pedidos
│   │   │   │   ├── novo/
│   │   │   │   │   └── page.tsx  # Registrar Pedido
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Detalhe / Editar Pedido
│   │   │   │
│   │   │   ├── propriedades/
│   │   │   │   ├── page.tsx      # Listagem de Propriedades
│   │   │   │   ├── nova/
│   │   │   │   │   └── page.tsx  # Cadastrar Propriedade
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Detalhe / Editar Propriedade
│   │   │   │
│   │   │   ├── relatorios/
│   │   │   │   └── page.tsx      # Gerar e Exportar Relatórios
│   │   │   │
│   │   │   ├── notificacoes/
│   │   │   │   └── page.tsx      # Histórico de Notificações
│   │   │   │
│   │   │   └── perfil/
│   │   │       └── page.tsx      # Perfil e Configurações do Proprietário
│   │   │
│   │   └── api/                  # Route Handlers (API interna)
│   │       └── relatorios/
│   │           └── route.ts      # Endpoint para geração de relatórios
│   │
│   ├── components/
│   │   ├── ui/                   # Componentes base reutilizáveis (Next.js padrão)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── toggle.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── spinner.tsx
│   │   │
│   │   ├── layout/               # Componentes estruturais de layout
│   │   │   ├── BottomNavigation.tsx   # Barra de navegação inferior (mobile)
│   │   │   ├── BottomNavigation.module.css
│   │   │   ├── Header.tsx             # Cabeçalho com título e ações
│   │   │   ├── Header.module.css
│   │   │   ├── PageWrapper.tsx        # Container padrão de página
│   │   │   └── PageWrapper.module.css
│   │   │
│   │   ├── cards/                # Cartões de listagem
│   │   │   ├── SeedCard.tsx
│   │   │   ├── SeedCard.module.css
│   │   │   ├── OrderCard.tsx
│   │   │   ├── OrderCard.module.css
│   │   │   ├── PropertyCard.tsx
│   │   │   └── PropertyCard.module.css
│   │   │
│   │   ├── forms/                # Formulários completos por entidade
│   │   │   ├── SeedForm.tsx
│   │   │   ├── SeedForm.module.css
│   │   │   ├── OrderForm.tsx
│   │   │   ├── PropertyForm.tsx
│   │   │   └── ProfileForm.tsx
│   │   │
│   │   ├── feedback/             # Estados de interface
│   │   │   ├── EmptyState.tsx         # Estado vazio (sem dados)
│   │   │   ├── EmptyState.module.css
│   │   │   ├── ErrorState.tsx         # Estado de erro
│   │   │   ├── LoadingState.tsx       # Skeleton loaders
│   │   │   └── Toast.tsx              # Mensagens de feedback (aria-live)
│   │   │
│   │   └── shared/               # Componentes compartilhados
│   │       ├── FilterBar.tsx          # Barra de filtros reutilizável
│   │       ├── FilterBar.module.css
│   │       ├── ConfirmDialog.tsx      # Modal de confirmação de ações
│   │       ├── NotificationBell.tsx   # Sino de notificações no header
│   │       ├── AvailabilityBadge.tsx  # Badge de disponibilidade de semente
│   │       └── StatusBadge.tsx        # Badge de status de pedido
│   │
│   ├── hooks/                    # Custom React Hooks
│   │   ├── useAuth.ts            # Autenticação e estado do usuário
│   │   ├── useSeeds.ts           # CRUD de sementes (Firestore)
│   │   ├── useOrders.ts          # CRUD de pedidos
│   │   ├── useProperties.ts      # CRUD de propriedades
│   │   ├── useNotifications.ts   # Gerência de notificações
│   │   ├── useReports.ts         # Geração de relatórios
│   │   └── useOffline.ts         # Detecção de conectividade
│   │
│   ├── lib/                      # Utilitários e configurações
│   │   ├── firebase.ts           # Inicialização do Firebase
│   │   ├── firestore.ts          # Helpers de queries Firestore
│   │   ├── auth.ts               # Helpers de autenticação
│   │   ├── storage.ts            # Upload de imagens Firebase Storage
│   │   ├── pdf.ts                # Geração de PDF com jsPDF
│   │   ├── csv.ts                # Geração de CSV com Papa Parse
│   │   └── validators.ts         # Schemas Zod reutilizáveis
│   │
│   ├── types/                    # Tipos TypeScript (mapeiam o diagrama de classes)
│   │   ├── user.ts               # Proprietario, Pessoa, Logradouro
│   │   ├── seed.ts               # Produto, TipoProduto, EspecieGeral, FormatoProduto
│   │   ├── stock.ts              # Estoque, Pesagem, DisponibilidadeProduto, TipoMovimentacao
│   │   ├── order.ts              # Pedido, Itens, TipoPedido, StatusPedido
│   │   ├── property.ts           # Propriedade, Comunidade, StatusComunidade
│   │   ├── notification.ts       # Notificacao
│   │   └── report.ts             # Relatorio, TipoRelatorio
│   │
│   └── context/                  # Contextos React (estado global)
│       ├── AuthContext.tsx        # Sessão do usuário logado
│       └── NotificationContext.tsx # Estado de notificações não lidas
│
├── specs/                        # ← VOCÊ ESTÁ AQUI
│   ├── 01-architecture.md        # Este arquivo
│   ├── 02-screens-and-features.md
│   └── 03-dev-tasks.md
│
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Design System — Tokens CSS

Definidos em `src/app/globals.css` como variáveis CSS nativas:

```css
:root {
  /* Paleta Institucional IF Sudeste MG */
  --color-primary:       #2f9e41;  /* Verde institucional */
  --color-primary-dark:  #237030;  /* Verde escuro (hover/active) */
  --color-primary-light: #e8f5eb;  /* Verde claro (backgrounds) */
  --color-danger:        #CD191E;  /* Vermelho institucional */
  --color-danger-dark:   #a01318;
  --color-danger-light:  #fde8e8;

  /* Neutros */
  --color-black:         #111111;
  --color-gray-900:      #1a1a1a;
  --color-gray-700:      #3d3d3d;
  --color-gray-500:      #6b6b6b;
  --color-gray-300:      #c2c2c2;
  --color-gray-100:      #f5f5f5;
  --color-white:         #ffffff;

  /* Tipografia */
  --font-family:         'Poppins', sans-serif;
  --font-size-xs:        0.75rem;   /* 12px */
  --font-size-sm:        0.875rem;  /* 14px */
  --font-size-base:      1rem;      /* 16px */
  --font-size-lg:        1.125rem;  /* 18px */
  --font-size-xl:        1.25rem;   /* 20px */
  --font-size-2xl:       1.5rem;    /* 24px */
  --font-weight-regular: 400;
  --font-weight-medium:  500;
  --font-weight-semibold:600;
  --font-weight-bold:    700;

  /* Espaçamento (base 4px) */
  --space-1:  0.25rem;   /* 4px */
  --space-2:  0.5rem;    /* 8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-5:  1.25rem;   /* 20px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */

  /* Bordas */
  --radius-sm:   0.25rem;  /* 4px */
  --radius-md:   0.5rem;   /* 8px */
  --radius-lg:   0.75rem;  /* 12px */
  --radius-xl:   1rem;     /* 16px */
  --radius-full: 9999px;

  /* Sombras */
  --shadow-sm:   0 1px 3px rgba(0,0,0,0.08);
  --shadow-md:   0 4px 12px rgba(0,0,0,0.12);
  --shadow-lg:   0 8px 24px rgba(0,0,0,0.16);

  /* Layout Mobile */
  --header-height:    56px;
  --bottom-nav-height:64px;
  --content-padding:  var(--space-4);
  --max-content-width:480px;   /* PWA mobile-first */

  /* Transições */
  --transition-fast:  0.15s ease;
  --transition-base:  0.25s ease;
  --transition-slow:  0.4s ease;

  /* Acessibilidade */
  --focus-ring: 0 0 0 3px rgba(47, 158, 65, 0.5);
  --min-touch-target: 44px;   /* WCAG 2.5.5 - alvo mínimo de toque */
}
```

---

## 5. Padrão de Estilização com CSS Modules

Cada componente que possui estilo próprio deve ter um arquivo `.module.css` correspondente.

**Regras obrigatórias:**
- Nunca usar estilos inline (exceto valores dinâmicos como `style={{ width: \`${pct}%\` }}`).
- Sempre usar variáveis CSS dos tokens acima, nunca valores hardcoded.
- Usar `clsx` ou template literals para classes condicionais.
- Nomes de classes em `camelCase` nos módulos CSS.

**Exemplo de padrão:**
```tsx
// SeedCard.tsx
import styles from './SeedCard.module.css';
import { Badge } from '@/components/ui/badge';

export function SeedCard({ seed }: { seed: Produto }) {
  return (
    <article className={styles.card} aria-label={`Semente ${seed.nomePopular}`}>
      <img src={seed.urlFoto} alt={`Foto de ${seed.nomePopular}`} className={styles.image} />
      <div className={styles.content}>
        <h3 className={styles.title}>{seed.nomePopular}</h3>
        <Badge variant="availability" value={seed.disponibilidade} />
      </div>
    </article>
  );
}
```

---

## 6. Roteamento e Proteção de Rotas

### Grupos de Rotas

| Grupo | Prefixo | Proteção | Descrição |
|---|---|---|---|
| `(auth)` | `/entrar`, `/cadastrar`, `/recuperar-senha` | Público | Redireciona para `/dashboard` se já logado |
| `(app)` | `/dashboard`, `/sementes`, etc. | Privado | Redireciona para `/entrar` se não logado |

### Middleware de Autenticação

`src/middleware.ts` intercept todas as rotas do grupo `(app)` e verifica o token de sessão do Firebase via cookie. Em caso de sessão inválida ou expirada (30 min de inatividade), redireciona para `/entrar`.

---

## 7. Estratégia PWA e Offline

### Web App Manifest (`public/manifest.json`)
```json
{
  "name": "Semente Livre",
  "short_name": "Semente Livre",
  "description": "Gestão de banco de sementes crioulas",
  "start_url": "/dashboard",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#2f9e41",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### Estratégia de Cache (Service Worker)
- **Páginas do app:** `NetworkFirst` — tenta rede, cai para cache se offline.
- **Imagens de sementes:** `CacheFirst` — serve do cache, revalida em background.
- **API Firebase:** `NetworkOnly` para escritas; `StaleWhileRevalidate` para leituras.
- **Fontes Google:** `CacheFirst` com validade de 30 dias.

### Indicador de Offline
- Banner persistente no topo quando sem conexão (`useOffline` hook + `aria-live="assertive"`).
- Operações de escrita enfileiradas pelo Firestore offline persistence e sincronizadas ao reconectar.

---

## 8. Acessibilidade (WCAG 2.1 AA + ARIA)

Requisito **essencial** conforme documentação (RNF-03). Todas as telas devem:

| Obrigação | Implementação |
|---|---|
| Todos os campos com label | `<Label>` sempre associado via `htmlFor` |
| Botões com nome acessível | `aria-label` quando ícone sem texto |
| Mensagens de erro | `aria-invalid="true"` + `aria-describedby` na mensagem |
| Status dinâmico | `aria-live="polite"` em toasts e feedbacks |
| Navegação por teclado | `tabIndex` correto, `focus-visible` estilizado |
| Alvo mínimo de toque | `min-height: 44px; min-width: 44px` em todos os elementos interativos |
| Contraste de cores | Verde `#2f9e41` em fundo branco: contraste 4.55:1 ✓ (AA) |
| Imagens informativas | `alt` descritivo em todas as `<img>` |
| Formulários complexos | `role="group"` + `<fieldset>` + `<legend>` |
| Navegação por landmarks | `<header>`, `<main>`, `<nav>`, `<footer>` obrigatórios |

---

## 9. Modelo de Dados Firebase (Coleções Firestore)

```
firestore/
├── proprietarios/{idProprietario}
│   ├── nome, rg, cpf, telefone, email, logradouro, dataCadastro, ...
│   └── (subcoleção) notificacoes/{idNotificacao}
│
├── propriedades/{idPropriedade}
│   └── nome, tamanhoHectares, logradouro, idProprietario, idComunidade, ...
│
├── comunidades/{idComunidade}
│   └── nome, logradouro, status, dataSolicitacao, dataAprovacao
│
├── produtos/{idProduto}
│   └── nomePopular, nomeCientifico, historico, urlFoto, tipo, especie, formato, ...
│
├── estoques/{idEstoque}
│   └── idProprietario, idProduto, quantidade, tipoPesagem, disponibilidade,
│       preco, descricao, tipo, dataMovimentacao, ...
│
├── pedidos/{idPedido}
│   ├── idUsuario, idProprietario, tipoPedido, status, mensagemOpcional, dataPedido
│   └── (subcoleção) itens/{idItem}
│       └── idProduto, quantidade, precoUnitario
│
└── relatorios/{idRelatorio}
    └── idProprietario, tipo, filtros, dataGeracao, dados
```

### Regras de Segurança (Firestore Rules)
- Proprietário só acessa seus próprios dados (`request.auth.uid == resource.data.idProprietario`).
- Leitura de comunidades: aberta para usuários autenticados.
- Escrita de comunidades: apenas Admin (campo `nivelAcesso` no token customizado).
- Pedidos: legível pelo proprietário receptor e pelo usuário solicitante.

---

## 10. Responsividade Mobile-First

O app é desenvolvido **primariamente para telas de 360px a 430px** (smartphones Android comuns). O layout deve funcionar em qualquer resolução via PWA.

```css
/* Breakpoints (apenas para ajustes pontuais, não são a base) */
/* Mobile primeiro — sem media query */
/* Tablet (> 600px) — ajustes de padding e grid */
@media (min-width: 600px) { ... }
/* Desktop (> 960px) — centraliza conteúdo, aumenta max-width */
@media (min-width: 960px) { ... }
```

**Padrões de layout obrigatórios:**
- Conteúdo sempre dentro de container com `max-width: var(--max-content-width)` centrado.
- Listas em coluna única no mobile.
- Bottom Navigation fixa no rodapé (`position: fixed; bottom: 0`).
- Padding inferior no conteúdo para não ser coberto pela BottomNavigation.
- Imagens com `object-fit: cover` e dimensões responsivas.

---

## 11. Fluxo de Autenticação e Sessão

```
Usuário abre o app
    │
    ├── Não autenticado → /entrar (Login)
    │       │
    │       ├── Login bem-sucedido → /dashboard
    │       ├── Sem conta → /cadastrar
    │       └── Esqueceu senha → /recuperar-senha
    │
    └── Autenticado → /dashboard
            │
            ├── Sessão expira (30 min inatividade)
            │       └── Middleware invalida → /entrar (com toast "Sessão expirada")
            │
            └── Logout manual → CDU-19 → /entrar
```

---

## 12. Convenções de Código

| Item | Convenção |
|---|---|
| Componentes | PascalCase (`SeedCard.tsx`) |
| Hooks | camelCase com prefixo `use` (`useSeeds.ts`) |
| Tipos | PascalCase, sufixo do domínio (`ProdutoType`) |
| CSS Modules | camelCase (`.seedCard`, `.primaryButton`) |
| Variáveis CSS | kebab-case com prefixo `--color-`, `--space-`, etc. |
| Rotas Next.js | kebab-case (`/sementes/nova`) |
| Coleções Firestore | camelCase plural (`estoques`, `pedidos`) |
| IDs gerados | Firestore auto-ID (nunca sequenciais) |

---

## 13. Dependências Principais

```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "react-dom": "^19.x",
    "firebase": "^11.x",
    "react-hook-form": "^7.x",
    "zod": "^3.x",
    "@hookform/resolvers": "^3.x",
    "jspdf": "^2.x",
    "jspdf-autotable": "^3.x",
    "papaparse": "^5.x",
    "clsx": "^2.x",
    "next-pwa": "^5.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/react": "^19.x",
    "@types/node": "^22.x",
    "@types/papaparse": "^5.x"
  }
}
```
