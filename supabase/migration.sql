-- MasterPlan CRM - Migration
-- Corre este SQL no Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Criar tabela de leads
create table if not exists public.leads (
  id                uuid        primary key default gen_random_uuid(),
  name              text        not null,
  whatsapp          text        not null,
  email             text,
  tally_response    text,
  source            text        not null default 'manual',
  created_at        timestamptz not null default now(),
  status            text        not null default 'novo',
  score             integer     not null default 0,
  notes             text,
  last_contacted_at timestamptz,
  contact_history   jsonb       not null default '[]'::jsonb,

  constraint leads_whatsapp_unique unique (whatsapp),
  constraint leads_source_check check (source in ('csv', 'manual')),
  constraint leads_status_check check (status in (
    'novo', 'contactado', 'respondeu', 'interessado',
    'comprou', 'nao_comprou', 'nao_qualificado'
  ))
);

-- 2. Row Level Security (sem sistema de auth - permite tudo para anon)
alter table public.leads enable row level security;

drop policy if exists "Allow all for anon" on public.leads;
create policy "Allow all for anon" on public.leads
  for all
  to anon
  using (true)
  with check (true);

-- 3. Activar Realtime
alter publication supabase_realtime add table public.leads;

-- 4. Indices para performance
create index if not exists leads_status_idx     on public.leads (status);
create index if not exists leads_score_idx      on public.leads (score desc);
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_whatsapp_idx   on public.leads (whatsapp);
