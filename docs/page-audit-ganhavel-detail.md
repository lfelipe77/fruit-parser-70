# Ficha de Página - GanhaveisDetail

## 📋 O que LÊ da Database

### Tabela/View: `raffles_public_money_ext`
- **Fields**: `id`, `title`, `description`, `image_url`, `status`, `ticket_price`, `draw_date`, `category_name`, `subcategory_name`, `amount_raised`, `goal_amount`, `progress_pct_money`, `last_paid_at`
- **Endpoint**: `supabase.from("raffles_public_money_ext").select("*").eq("id", id).maybeSingle()`
- **Trigger**: `useEffect` on `id` param change
- **Estado**: `raffleRaw` → normalized to `raffle`

### Tabela/View: `user_profiles_public` 
- **Status**: ❌ TODO - Not connected yet
- **Fields needed**: All organizer profile fields
- **Missing connection**: Need `owner_user_id` in `raffles_public_money_ext` view

## 📝 O que GRAVA na Database

### Nenhuma gravação direta
- **Navigation only**: Redirects to payment confirmation with `toConfirm(id, qty)`
- **Future**: Will create transactions/tickets on purchase

## 🎭 Mocks Identificados

### Organizer Profile (DetalhesOrganizador)
```typescript
// Currently hardcoded data:
{
  name: "João Silva",
  username: "joaosilva", 
  bio: "Organizador experiente...",
  totalGanhaveisLancados: 47,
  ganhaveisCompletos: 43,
  // ... etc
}
```
**TODO**: Connect to real user data via `owner_user_id`

### Details & Rules Tabs
```typescript
// Hardcoded HTML content:
const FALLBACK_DETAILS = `<h3>Detalhes do Prêmio</h3>...`
const FALLBACK_RULES = `<h3>Regulamento da Rifa</h3>...`
```
**TODO**: Store in database fields or CMS

## ⚡ Realtime

### Nenhum realtime implementado
**Candidates for realtime**:
- Campaign progress updates (`amount_raised`, `progress_pct_money`)
- Last payment timestamp (`last_paid_at`)
- Active/inactive status changes

## 🔒 Regras de Visibilidade

### RLS Policy
- **View**: `raffles_public_money_ext` - Publicly accessible (no auth required)
- **Status filter**: Shows all raffles regardless of status
- **Future**: May need to filter by `status = 'active'` for public access

### UI Visibility Rules
- **Buy button**: Disabled when `!raffle.isActive` (status !== 'active')
- **Progress bar**: Always visible
- **Share button**: Always visible
- **Organizer profile**: Always visible (mock data)

## 🏗️ Data Flow Architecture

```
URL param (id) 
  ↓
useEffect hook
  ↓  
supabase query (raffles_public_money_ext)
  ↓
raffleRaw state
  ↓
adaptRaffleDetail() normalizer
  ↓
raffle (normalized)
  ↓
UI components
```

## 🔧 Adapter Pattern

### Data Normalization
- **Input**: `RaffleDetailRaw` (database format)
- **Output**: `RaffleDetailNormalized` (UI-friendly format) 
- **Fallbacks**: All fields have sensible defaults
- **Helpers**: `toConfirm(id, qty)` for navigation

### Key Transformations
- `image_url` → `imageUrl` + fallback image
- `ticket_price` → `ticketPrice` 
- `progress_pct_money` → `progressPercent` (clamped 0-100)
- `status` → `isActive` boolean
- `draw_date` → `drawLabel` formatted

## 🚀 Next Steps para Database Connection

1. **Add `owner_user_id` to raffles_public_money_ext view**
2. **Connect organizer profile data via user_profiles_public**  
3. **Add realtime subscriptions for live updates**
4. **Move Details/Rules content to database fields**
5. **Implement actual ticket purchase flow**