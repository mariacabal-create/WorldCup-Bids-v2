-- =====================================================
-- Subasta de Marcadores · Mundial 2026
-- Esquema completo para Supabase (PostgreSQL)
-- =====================================================

-- Tabla de partidos (104, cargados una sola vez desde matches.json)
create table if not exists matches (
  id integer primary key,
  date date not null,
  time text not null,              -- hora ET, "HH:MM"
  kickoff timestamptz not null,    -- fecha+hora exacta de inicio (usado para cerrar pujas)
  home text not null,
  away text not null,
  venue text not null,
  city text not null,
  phase text not null,             -- "Fase de grupos" | "Dieciseisavos" | "Octavos" | "Cuartos" | "Semifinal" | "Tercer puesto" | "Final"
  group_name text                  -- "A".."L" solo en fase de grupos
);

create index if not exists idx_matches_kickoff on matches (kickoff);

-- Postores (identificación simple: nombre + email, sin contraseña)
create table if not exists bidders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- Pujas: una fila por cada puja realizada (historial completo)
create table if not exists bids (
  id uuid primary key default gen_random_uuid(),
  match_id integer not null references matches(id) on delete cascade,
  bidder_id uuid not null references bidders(id) on delete cascade,
  home_score integer not null check (home_score >= 0 and home_score <= 7),
  away_score integer not null check (away_score >= 0 and away_score <= 7),
  amount_usd numeric(10,2) not null check (amount_usd > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_bids_match on bids (match_id, amount_usd desc);
create index if not exists idx_bids_bidder on bids (bidder_id);

-- Vista: puja más alta vigente por partido (para no tener que calcularlo en el cliente)
create or replace view current_top_bids as
select distinct on (b.match_id)
  b.match_id,
  b.id as bid_id,
  b.home_score,
  b.away_score,
  b.amount_usd,
  b.created_at,
  bd.name as bidder_name
from bids b
join bidders bd on bd.id = b.bidder_id
order by b.match_id, b.amount_usd desc, b.created_at asc;

-- =====================================================
-- Row Level Security
-- =====================================================
alter table matches enable row level security;
alter table bidders enable row level security;
alter table bids enable row level security;

-- Cualquiera puede leer partidos
create policy "matches_select_public" on matches
  for select using (true);

-- Cualquiera puede leer postores (solo nombre, para mostrar "puja de Juan")
create policy "bidders_select_public" on bidders
  for select using (true);

-- Cualquiera puede registrarse como postor
create policy "bidders_insert_public" on bidders
  for insert with check (true);

-- Cualquiera puede leer pujas
create policy "bids_select_public" on bids
  for select using (true);

-- Insertar pujas: solo si el partido no ha comenzado (kickoff en el futuro)
-- y solo si la puja es mayor que la puja máxima actual para ese partido.
create policy "bids_insert_before_kickoff" on bids
  for insert with check (
    exists (
      select 1 from matches m
      where m.id = match_id
      and m.kickoff > now()
    )
  );

-- =====================================================
-- Función de validación adicional (server-side) que además
-- exige que la nueva puja supere la máxima vigente.
-- Se invoca vía RPC desde el cliente para tener un mensaje de error claro.
-- =====================================================
create or replace function place_bid(
  p_match_id integer,
  p_bidder_name text,
  p_bidder_email text,
  p_home_score integer,
  p_away_score integer,
  p_amount_usd numeric
) returns bids
language plpgsql
security definer
as $$
declare
  v_bidder_id uuid;
  v_kickoff timestamptz;
  v_current_max numeric;
  v_new_bid bids;
begin
  select kickoff into v_kickoff from matches where id = p_match_id;
  if v_kickoff is null then
    raise exception 'El partido no existe.';
  end if;
  if v_kickoff <= now() then
    raise exception 'La subasta para este partido ya cerró (el partido ya comenzó).';
  end if;

  select coalesce(max(amount_usd), 0) into v_current_max
  from bids where match_id = p_match_id;

  if p_amount_usd <= v_current_max then
    raise exception 'Tu puja debe ser mayor a la puja actual (USD %).', v_current_max;
  end if;

  insert into bidders (name, email)
  values (trim(p_bidder_name), lower(trim(p_bidder_email)))
  on conflict (email) do update set name = excluded.name
  returning id into v_bidder_id;

  insert into bids (match_id, bidder_id, home_score, away_score, amount_usd)
  values (p_match_id, v_bidder_id, p_home_score, p_away_score, p_amount_usd)
  returning * into v_new_bid;

  return v_new_bid;
end;
$$;

-- =====================================================
-- Habilitar Realtime en la tabla bids (para ver pujas en vivo)
-- =====================================================
alter publication supabase_realtime add table bids;
