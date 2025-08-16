# Ficha de Página — DiscoverRaffles (Descobrir Ganhaveis)

## Leitura (READ)
- **Tabelas/Views:**
  - `categories` - categorias para filtros
  - `raffles_public_money_ext` - lista de ganhaveis para exibição principal
- **Colunas usadas:**
  - `categories`: `id`, `nome`, `slug`, `sort_order`, `destaque`, `icone_url`
  - `raffles_public_money_ext`: `id`, `title`, `image_url`, `ticket_price`, `amount_raised`, `goal_amount`, `progress_pct_money`, `category_name`, `subcategory_name`, `status`, `last_paid_at`
- **Filtros (where):**
  - `title` ILIKE search term (busca por título)
  - `category_id` = selectedCategory (filtro por categoria)
  - Status implícito (view já filtra active)
- **Ordem/Limite:**
  - Ordenação: popularity (progress_pct_money DESC), ending-soon (last_paid_at ASC), newest (last_paid_at DESC), goal (goal_amount DESC)
  - Limite: 12 itens por página com paginação
- **Realtime?** Não

## Escrita (WRITE)
- **Tabelas:** Nenhuma gravação direta
- **Operações:** Apenas navegação para páginas de detalhe
- **Payload:** N/A
- **RLS esperado:** N/A

## Elementos de UI ↔ Dados

### Header Hero Section
- `<h1>` → Texto estático "Descobrir Ganhaveis"
- `<Input searchTerm>` → query filter em `raffles_public_money_ext.title`

### Filtros e Controles
- `<Badge categories>` → `categories.nome` (fallback: "Categoria")
- `<Select sortBy>` → ORDER BY clauses diferentes
- `<Badge selectedCategory>` → `categories.nome` + count (TODO: count real)

### Grid de Cards (RaffleCard)
- `<img>` → `raffle.image_url` (fallback: "/placeholder.svg")
- `<h3 title>` → `raffle.title` (fallback: "Título não disponível")
- `<Badge category>` → `raffle.category_name` (fallback: null, não exibe)
- `<Badge meta alcançada>` → calculado se `progress_pct_money >= 100`
- `<span arrecadado>` → `formatCurrency(raffle.amount_raised)` (fallback: R$ 0,00)
- `<span meta>` → `formatCurrency(raffle.goal_amount)` (fallback: R$ 0,00)
- `<div progress bar>` → `progress_pct_money` clamped 0-100% (fallback: 0%)
- `<span bilhete>` → `formatCurrency(raffle.ticket_price)` (fallback: R$ 0,00)
- `<div última compra>` → `useRelativeTime(raffle.last_paid_at)` (fallback: "—")

### Paginação
- `<Button anterior/próxima>` → estado local `currentPage` + `hasMorePages` calculado
- `<span página>` → `currentPage + 1`

### Navegação
- `<Link to="/ganhavel/${raffle.id}">` → navegação para página de detalhes

## Mocks / Estado Local
- **`searchTerm`**: estado local para busca (não persiste). Plano de conexão: query parameter
- **`selectedCategory`**: estado local para filtro (não persiste). Plano de conexão: query parameter 
- **`sortBy`**: estado local para ordenação (não persiste). Plano de conexão: query parameter
- **`currentPage`**: estado local para paginação (não persiste). Plano de conexão: query parameter
- **Category count**: hardcoded como 0. Plano de conexão: `category_stats` view com contagem real

## Regras de Visibilidade
- **Público**: Página totalmente pública, sem necessidade de autenticação
- **Comportamentos com usuário não logado**: 
  - Funciona completamente sem login
  - Navegação para detalhes funciona sem auth
  - Cards mostram todos os dados públicos

## Erros e Fallbacks
- **`image_url` null**: fallback para "/placeholder.svg"
- **`category_name` null**: badge não é exibido
- **`last_paid_at` null**: "—" é exibido
- **Search sem resultados**: tela de estado vazio com botão "Limpar Filtros"
- **Loading state**: skeleton cards (12 placeholders)
- **Network errors**: console.error, mas não tratamento na UI

## Telemetria / Logs (opcional)
- **Search events**: poderia logar termos de busca populares
- **Category filter usage**: métricas de categorias mais filtradas
- **Pagination depth**: quantas páginas usuários navegam
- **Card click events**: quais ganhaveis são mais clicados

## Dívida Técnica / TODO
- **Query parameters**: search, category, sort, page não persistem na URL
- **Category count real**: usar `category_stats` view em vez de hardcoded 0
- **Error handling**: adicionar toast/alert para erros de rede
- **Infinite scroll**: alternativa à paginação tradicional
- **Loading states**: melhorar UX com skeleton mais detalhado
- **Image optimization**: lazy loading, srcset, WebP
- **Filters persistence**: manter filtros entre navegações
- **Analytics**: tracking de interações e conversões