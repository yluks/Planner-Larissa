-- Banco de provas anteriores (ENARE e outras residências em Odontologia)
-- Conteúdo de leitura pública; inserção/edição só pelo painel do Supabase (service role).

create extension if not exists pgcrypto;

create table if not exists public.provas (
  id uuid primary key default gen_random_uuid(),
  exame text not null default 'ENARE',          -- ENARE, USP, UNIFESP...
  ano int not null check (ano between 2000 and 2100),
  banca text,                                   -- ex.: FGV
  programa text not null default 'Odontologia', -- ex.: Odontologia, CTBMF, Multiprofissional
  total_questoes int,
  link_prova text,
  link_gabarito text,
  created_at timestamptz not null default now(),
  unique (exame, ano, programa)
);

create table if not exists public.questoes (
  id uuid primary key default gen_random_uuid(),
  prova_id uuid not null references public.provas(id) on delete cascade,
  numero int not null,
  -- mesmo id das áreas de src/data/edital.js (sus, coletiva, cirurgia, estomato...)
  area_id text not null check (area_id in (
    'sus', 'coletiva', 'biosseg', 'etica', 'anatomia', 'farmaco', 'anestesia', 'sistemico',
    'cirurgia', 'estomato', 'radio', 'perio', 'dentistica', 'endo', 'odontoped', 'protese', 'orto'
  )),
  assunto text,
  enunciado text not null,
  -- [{"letra": "A", "texto": "..."}, ...]
  alternativas jsonb not null check (jsonb_typeof(alternativas) = 'array'),
  gabarito char(1) check (gabarito in ('A', 'B', 'C', 'D', 'E')),
  anulada boolean not null default false,
  comentario text,
  created_at timestamptz not null default now(),
  unique (prova_id, numero),
  check (anulada or gabarito is not null)
);

create index if not exists questoes_area_idx on public.questoes (area_id);
create index if not exists questoes_prova_idx on public.questoes (prova_id);

alter table public.provas enable row level security;
alter table public.questoes enable row level security;

drop policy if exists "provas leitura publica" on public.provas;
create policy "provas leitura publica" on public.provas
  for select to anon, authenticated using (true);

drop policy if exists "questoes leitura publica" on public.questoes;
create policy "questoes leitura publica" on public.questoes
  for select to anon, authenticated using (true);
