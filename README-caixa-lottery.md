# CAIXA Lottery Integration - Complete Setup Guide

Este documento contém o guia completo para configurar, testar e manter a integração com os dados das loterias da CAIXA no projeto Ganhavel.

## 📋 Visão Geral

A integração permite:
- Buscar próximos sorteios da CAIXA automaticamente
- Sincronizar resultados da Loteria Federal
- Exibir dados reais na homepage (seção "Próximos Sorteios da Caixa")
- Mostrar resultados oficiais na página /resultados

## 🚀 Backend - Edge Functions

### 1. Edge Functions Criadas

**Local**: `supabase/functions/`

#### caixa-probe (GET)
- **Função**: Testa conectividade com API da CAIXA
- **Endpoint**: `https://whqxpuyjxoiufzhvqneg.functions.supabase.co/caixa-probe`
- **Retorna**: Status HTTP, content-type, primeiros 600 chars da resposta

#### caixa-next (POST)
- **Função**: Busca próximos sorteios e upsert em `lottery_next_draws`
- **Endpoint**: `https://whqxpuyjxoiufzhvqneg.functions.supabase.co/caixa-next`
- **API Source**: `https://servicebus2.caixa.gov.br/portaldeloterias/api/home/ultimos-resultados`
- **Normaliza**: game_slug, game_name, next_date, next_time

#### federal-sync (POST)
- **Função**: Busca resultados da Loteria Federal e upsert em `federal_draws`
- **Endpoint**: `https://whqxpuyjxoiufzhvqneg.functions.supabase.co/federal-sync`
- **API Source**: `https://servicebus2.caixa.gov.br/portaldeloterias/api/home/ultimos-resultados`
- **Normaliza**: concurso_number, draw_date, prizes, first_prize

### 2. Configuração de Secrets

Necessários no Supabase Edge Function Secrets:
```
SUPABASE_URL=https://whqxpuyjxoiufzhvqneg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

### 3. User-Agent e Headers

Todas as funções usam:
```javascript
headers: {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
}
```

## 🗄️ Database Schema

### Tables

#### lottery_next_draws
```sql
CREATE TABLE public.lottery_next_draws (
  id bigserial PRIMARY KEY,
  game_slug text UNIQUE NOT NULL,
  game_name text NOT NULL,
  next_date date,
  next_time text,
  source_url text,
  raw jsonb,
  updated_at timestamp with time zone DEFAULT now()
);
```

#### federal_draws
```sql
CREATE TABLE public.federal_draws (
  id bigserial PRIMARY KEY,
  concurso_number text UNIQUE NOT NULL,
  draw_date date NOT NULL,
  first_prize text,
  prizes jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_url text,
  raw jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### Row Level Security (RLS)

Ambas as tabelas têm RLS habilitado com políticas:
- **SELECT**: Permitido para todos (anon/authenticated)
- **INSERT/UPDATE/DELETE**: Apenas service role

## 🎨 Frontend Components

### 1. CaixaLotterySection.tsx

**Localização**: `src/components/CaixaLotterySection.tsx`

**Funcionamento**:
- Remove `sampleData` hardcoded
- Busca dados reais via Supabase:
  ```javascript
  supabase.from("lottery_next_draws")
    .select("game_slug, game_name, next_date, next_time")
    .order("game_slug");
  ```
- Renderiza cards com datas/horários reais
- Fallback suave para placeholder se vazio/erro
- Botão "Últimos Números (Ganhadores)" → `/resultados`

### 2. Página Resultados

**Localização**: `src/pages/Resultados.tsx`

**Novidades**:
- Nova aba "Loteria Federal" 
- Busca dados de `federal_draws`
- Exibe últimos 10 resultados oficiais
- Formato: concurso_number, draw_date (pt-BR), lista de prêmios
- Empty state se sem dados

## 🧪 Testing & Commands

### 1. Teste das Edge Functions

```bash
# 1) Teste de conectividade
curl -s https://whqxpuyjxoiufzhvqneg.functions.supabase.co/caixa-probe | jq .

# 2) Executar sync de próximos sorteios
curl -s -X POST https://whqxpuyjxoiufzhvqneg.functions.supabase.co/caixa-next | jq .

# 3) Executar sync da Loteria Federal
curl -s -X POST https://whqxpuyjxoiufzhvqneg.functions.supabase.co/federal-sync | jq .
```

### 2. Verificação no Database

```sql
-- Verificar próximos sorteios
SELECT game_slug, game_name, next_date, next_time, updated_at 
FROM public.lottery_next_draws 
ORDER BY game_slug;

-- Verificar resultados da Federal
SELECT concurso_number, draw_date, first_prize, jsonb_array_length(prizes) as prizes_count, created_at
FROM public.federal_draws 
ORDER BY draw_date DESC, concurso_number DESC 
LIMIT 5;

-- Contar total de registros
SELECT 
  (SELECT COUNT(*) FROM lottery_next_draws) as next_draws_count,
  (SELECT COUNT(*) FROM federal_draws) as federal_draws_count;
```

### 3. Load Testing (Opcional)

```bash
# Teste de carga com hey
hey -n 500 -c 50 https://whqxpuyjxoiufzhvqneg.functions.supabase.co/caixa-probe

# Teste PostgREST endpoint
hey -n 100 -c 10 -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndocXhwdXlqeG9pdWZ6aHZxbmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjYyODMsImV4cCI6MjA2OTc0MjI4M30.lXLlvJkB48KSUsroImqkZSjNLpQjg7Pe_bYH5h6ztjo" \
  "https://whqxpuyjxoiufzhvqneg.supabase.co/rest/v1/lottery_next_draws?select=game_slug,game_name,next_date,next_time"
```

### 4. k6 Script Exemplo

```javascript
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  let response = http.get('https://whqxpuyjxoiufzhvqneg.functions.supabase.co/caixa-probe');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 2000ms': (r) => r.timings.duration < 2000,
  });
}
```

## 🔄 Deployment

As Edge Functions são deployadas automaticamente com o código. Para deploy manual:

```bash
supabase functions deploy caixa-probe
supabase functions deploy caixa-next  
supabase functions deploy federal-sync
```

## 🔧 Manutenção & Monitoramento

### 1. Logs das Functions
- Acesse: [Edge Function Logs](https://supabase.com/dashboard/project/whqxpuyjxoiufzhvqneg/functions)
- Monitore erros, timeouts, rate limits

### 2. Schedule Automático (Recomendado)
Configure cron jobs ou triggers para executar:
- `caixa-next`: Diariamente às 9h e 18h
- `federal-sync`: Após cada sorteio da Federal (ter/sex 20h)

### 3. Alertas de Erro
Monitore falhas via:
- Supabase Dashboard → Functions → Logs
- Logs de erro no browser (DevTools)
- Métricas de availability

## 🐛 Troubleshooting

### Problema: Functions retornam 403
- ✅ Verificar secrets configurados
- ✅ Confirmar SERVICE_ROLE_KEY válida
- ✅ RLS policies corretas

### Problema: Tabelas vazias
- ✅ Executar POST requests (caixa-next, federal-sync)
- ✅ Verificar logs das functions
- ✅ Testar caixa-probe primeiro

### Problema: Frontend sem dados
- ✅ Verificar network tab no DevTools
- ✅ Confirmar RLS permite SELECT public
- ✅ Testar query Supabase SQL Editor

### Problema: CORS errors
- ✅ Verificar origin headers
- ✅ Functions usam withCORS wrapper
- ✅ Adicionar domínio em ALLOWED_ORIGINS

## ✅ Critérios de Sucesso

1. **Homepage carrega dados reais** - sem hardcoded sampleData
2. **caixa-probe retorna status 200** com contentType válido  
3. **caixa-next popula lottery_next_draws** com game_slug, dates
4. **federal-sync popula federal_draws** com concursos recentes
5. **Página /resultados mostra Federal** - aba funcional
6. **Botão "Últimos Números" funciona** - rota para /resultados
7. **Load testing passa** - 500 requests sem timeout
8. **Logs limpos** - sem errors críticos

## 📞 Suporte

Para issues relacionadas à integração CAIXA:
1. Verificar logs das Edge Functions
2. Testar endpoints CAIXA diretamente  
3. Confirmar schema das tabelas
4. Revisar RLS policies
5. Validar secrets configurados

---

**Última atualização**: 2025-01-20  
**Versão**: 1.0.0