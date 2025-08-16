# Ficha de Página — Admin (Super Admin Panel)

## Leitura (READ)
- **Tabelas/Views:**
  - `raffles_public_money_ext` - lista principal de ganhaveis para aprovação/gestão
  - `categories` - categorias para filtros (via getAllCategories helper)
  - `user_profiles` - validação de permissão admin (via RLS/hooks)
- **Colunas usadas:**
  - `raffles_public_money_ext`: `id`, `title`, `image_url`, `ticket_price`, `amount_raised`, `goal_amount`, `progress_pct_money`, `category_name`, `subcategory_name`, `status`, `last_paid_at`
  - `categories`: todas as colunas (via helper getAllCategories)
  - `user_profiles`: `role` field para verificar se user.role === 'admin'
- **Filtros (where):**
  - `title` ILIKE searchTerm (busca por título)
  - `status` = selectedTab quando não for "todas"
  - `category_name` = selectedCategory quando não for "todas"
- **Ordem/Limite:**
  - ORDER BY `last_paid_at` DESC (mais recentes primeiro)
  - Sem limite (carrega todos os ganhaveis)
- **Realtime?** Não implementado

## Escrita (WRITE)
- **Tabelas:** `raffles` (não diretamente na view, mas tabela base)
- **Operações:** 
  - UPDATE `raffles` SET `status` = 'active' WHERE `id` = ganhaveisId (aprovação)
  - UPDATE `raffles` SET `status` = 'rejected' WHERE `id` = ganhaveisId (rejeição)
  - INSERT `audit_logs` via logAdminAction() (todas as ações administrativas)
- **Payload (shape):**
  - Aprovação: `{ status: 'active' }`
  - Rejeição: `{ status: 'rejected' }`
  - Logs: `{ targetRaffleId, reason, action_type }`
- **RLS esperado:** 
  - Acesso de escrita limitado ao próprio owner do raffle OU admin
  - Logs de auditoria protegidos (apenas admins podem ler)

## Elementos de UI ↔ Dados

### Header e Stats Cards
- `<h1>` → Texto estático "Gestão de Ganhaveis"
- `<div Total>` → `safeRaffles.length` (conta total de ganhaveis)
- `<div Pendentes>` → `safeRaffles.filter(r => r.status === "pending").length`
- `<div Ativos>` → `safeRaffles.filter(r => r.status === "active").length`
- `<div Concluídos>` → `safeRaffles.filter(r => r.status === "completed").length`

### Filtros e Controles
- `<Input searchTerm>` → filter em `raffles_public_money_ext.title`
- `<Select categoria>` → filter em `raffles_public_money_ext.category_name`
- `<Tabs status>` → filter em `raffles_public_money_ext.status`

### Tabela de Ganhaveis (AdminRaffleRow)
- `<div título>` → `raffle.title` (fallback: "Sem título")
- `<div categoria>` → `raffle.category_name` (fallback: não exibe)
- `<Badge status>` → `getStatusBadge(raffle.status)` com cores/ícones específicos
- `<div arrecadado>` → `formatBRL(raffle.amount_raised)` (fallback: R$ 0,00)
- `<div meta>` → `formatBRL(raffle.goal_amount)` (fallback: R$ 0,00)
- `<div progresso>` → `Math.round(raffle.progress_pct_money)%` clamped 0-100
- `<div último pagamento>` → `useRelativeTime(raffle.last_paid_at)` (fallback: "—")

### Modal de Detalhes
- `<Dialog conteúdo>` → `selectedGanhavel` (estado local, dados do raffle)
- `<Textarea observações>` → `adminNotes` (estado local, não persiste)

### Dashboard Administrativo
- **MOCK**: `stats` array hardcoded com valores fictícios
- **MOCK**: `pendingRifas` array hardcoded 
- **MOCK**: `recentActivities` array hardcoded

## Mocks / Estado Local
- **Dashboard stats**: totalmente hardcoded. Plano de conexão: queries agregadas reais
- **Dashboard pendingRifas**: lista fixa de 3 items. Plano de conexão: query real em `raffles WHERE status='pending'`
- **Dashboard recentActivities**: lista fixa de eventos. Plano de conexão: `audit_logs` recentes
- **`searchTerm`**: estado local para busca (não persiste). Plano de conexão: query parameter
- **`selectedCategory`**: estado local para filtro (não persiste). Plano de conexão: query parameter
- **`selectedTab`**: estado local para status (não persiste). Plano de conexão: query parameter
- **`adminNotes`**: estado local para observações (não persiste). Plano de conexão: nova coluna `admin_notes` na tabela raffles

## Regras de Visibilidade
- **Admin-only**: Página totalmente restrita a usuários com role='admin'
- **Proteção de rota**: `AdminProtectedRoute` verifica `user_profiles.role`
- **Hooks de verificação**: `useAdminCheck()` e `useMyProfile().isAdmin`
- **Comportamentos com usuário não logado**: 
  - Redirecionamento automático para /dashboard
  - Loading state enquanto verifica permissões
  - Acesso negado se não for admin

## Erros e Fallbacks
- **Lista vazia**: "Nenhum ganhavel encontrado" quando `safeRaffles.length === 0`
- **Loading state**: skeleton cards e spinner
- **Erro de rede**: console.error, toast de erro em ações
- **Dados null**: sempre fallback para arrays vazios `Array.isArray(data) ? data : []`
- **Filtros sem resultado**: "Nenhum ganhavel encontrado" na tabela
- **Missing admin role**: redirecionamento + loading spinner

## Telemetria / Logs (opcional)
- **Admin actions**: todas as ações são logadas via `logAdminAction()`
- **Aprovações/Rejeições**: contexto completo registrado em audit_logs
- **Filtros usage**: poderia logar quais filtros admins mais usam
- **Performance**: tempo de carregamento da lista de ganhaveis

## Dívida Técnica / TODO

### Conexões de Banco Faltantes
1. **Dashboard stats reais**: conectar contadores a queries agregadas
2. **Dashboard pending rifas**: usar query real em vez de array hardcoded
3. **Dashboard recent activities**: conectar a `audit_logs` recentes  
4. **Admin notes persistence**: adicionar coluna `admin_notes` na tabela raffles
5. **Query parameters**: search, category, status não persistem na URL

### Funcionalidades Pendentes
6. **Suspend/Reactivate real**: apenas logga, não atualiza status no banco
7. **Batch operations**: aprovação/rejeição em massa
8. **Advanced filters**: data range, valor range, organizador
9. **Export functionality**: CSV/Excel dos ganhaveis filtrados
10. **Realtime updates**: notificações quando novos ganhaveis chegam
11. **Image moderation**: preview e ferramentas de moderação de imagens
12. **Organizer profiles**: link para perfis dos organizadores

### Status Atual das Conexões
- ✅ **Lista de ganhaveis**: conectada a `raffles_public_money_ext`
- ✅ **Filtros básicos**: funcionam com dados reais
- ✅ **Approve/Reject**: atualizam status real na tabela `raffles`
- ✅ **Audit logging**: registra todas as ações administrativas
- ❌ **Dashboard cards**: ainda são valores mock
- ❌ **Admin notes**: não persistem no banco
- ❌ **Suspend/Reactivate**: apenas mock (log only)

## Próximos Passos Críticos
1. Conectar dashboard stats a queries reais
2. Implementar persistência de admin notes
3. Completar operações de suspend/reactivate
4. Adicionar realtime para novos ganhaveis pendentes