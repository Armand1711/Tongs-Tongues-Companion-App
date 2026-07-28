-- Tongs & Tongues — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
create extension if not exists "pgcrypto";

-- ============================================================================
-- FEATURE 1 — CARD COLLECTION SYSTEM
-- ============================================================================

create table if not exists public.cards (
  id text primary key, -- short QR id, e.g. 'CHR-ZU'
  item_name text not null, -- e.g. 'Charcoal'
  item_slug text not null, -- e.g. 'charcoal' (used in /collection/[item])
  language text not null, -- e.g. 'Zulu'
  language_code text not null, -- e.g. 'ZU'
  word text not null, -- the translated word
  phonetic text not null, -- phonetic pronunciation guide
  image_url text,
  created_at timestamptz not null default now()
);

create unique index if not exists cards_item_language_idx
  on public.cards (item_slug, language_code);

create table if not exists public.user_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  card_id text not null references public.cards (id) on delete cascade,
  collected_at timestamptz not null default now(),
  unique (user_id, card_id)
);

create index if not exists user_collections_user_id_idx on public.user_collections (user_id);

alter table public.cards enable row level security;
alter table public.user_collections enable row level security;

-- Cards are public reference data — anyone (including anonymous auth users) can read them.
drop policy if exists "cards are readable by everyone" on public.cards;
create policy "cards are readable by everyone"
  on public.cards for select
  using (true);

-- Users (including anonymous) can only see and manage their own collected cards.
drop policy if exists "users can read own collections" on public.user_collections;
create policy "users can read own collections"
  on public.user_collections for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert own collections" on public.user_collections;
create policy "users can insert own collections"
  on public.user_collections for insert
  with check (auth.uid() = user_id);

-- ============================================================================
-- FEATURE 2 — BRAAI FEED
-- ============================================================================

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  image_url text not null,
  caption text,
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists votes_post_id_idx on public.votes (post_id);

alter table public.posts enable row level security;
alter table public.votes enable row level security;

drop policy if exists "posts are readable by everyone" on public.posts;
create policy "posts are readable by everyone"
  on public.posts for select
  using (true);

drop policy if exists "users can insert own posts" on public.posts;
create policy "users can insert own posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

drop policy if exists "votes are readable by everyone" on public.votes;
create policy "votes are readable by everyone"
  on public.votes for select
  using (true);

drop policy if exists "users can insert own votes" on public.votes;
create policy "users can insert own votes"
  on public.votes for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can delete own votes" on public.votes;
create policy "users can delete own votes"
  on public.votes for delete
  using (auth.uid() = user_id);

-- View: posts with a precomputed vote count. Ranking/time-window filtering is
-- still done in the query layer (lib/supabase/queries.ts) so a single window
-- param can drive both the WHERE and ORDER BY without N different views.
create or replace view public.posts_with_votes as
select
  p.id,
  p.user_id,
  p.image_url,
  p.caption,
  p.created_at,
  count(v.id) as vote_count
from public.posts p
left join public.votes v on v.post_id = p.id
group by p.id;

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================
-- Run once. Public read (card art + braai photos are not sensitive), writes
-- restricted to authenticated (incl. anonymous) sessions.

insert into storage.buckets (id, name, public)
values ('card-images', 'card-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('braai-photos', 'braai-photos', true)
on conflict (id) do nothing;

drop policy if exists "card images are publicly readable" on storage.objects;
create policy "card images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'card-images');

drop policy if exists "braai photos are publicly readable" on storage.objects;
create policy "braai photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'braai-photos');

drop policy if exists "authenticated users can upload braai photos" on storage.objects;
create policy "authenticated users can upload braai photos"
  on storage.objects for insert
  with check (bucket_id = 'braai-photos' and auth.role() = 'authenticated');

-- ============================================================================
-- SEED DATA — 5 items x 5 languages = 25 cards
-- ============================================================================
-- NOTE: translations/phonetics below are placeholder content for scaffolding
-- purposes only. Have a native-speaking linguist/cultural consultant verify
-- all isiZulu, isiXhosa, Afrikaans, Sesotho and Setswana copy before this goes
-- anywhere near production — several of these are simplified/approximate.

insert into public.cards (id, item_name, item_slug, language, language_code, word, phonetic) values
  ('CHR-ZU', 'Charcoal', 'charcoal', 'Zulu', 'ZU', 'Amalahle', 'ah-mah-DLAH-shleh'),
  ('CHR-XH', 'Charcoal', 'charcoal', 'Xhosa', 'XH', 'Amalahle', 'ah-mah-HLAH-hleh'),
  ('CHR-AF', 'Charcoal', 'charcoal', 'Afrikaans', 'AF', 'Houtskool', 'HOYT-skoal'),
  ('CHR-SO', 'Charcoal', 'charcoal', 'Sesotho', 'SO', 'Malaha', 'mah-LAH-hah'),
  ('CHR-TS', 'Charcoal', 'charcoal', 'Setswana', 'TS', 'Malahe', 'mah-LAH-heh'),

  ('KET-ZU', 'Kettle', 'kettle', 'Zulu', 'ZU', 'Iketela', 'ee-keh-TEH-lah'),
  ('KET-XH', 'Kettle', 'kettle', 'Xhosa', 'XH', 'Iketile', 'ee-keh-TEE-leh'),
  ('KET-AF', 'Kettle', 'kettle', 'Afrikaans', 'AF', 'Ketel', 'KEE-tel'),
  ('KET-SO', 'Kettle', 'kettle', 'Sesotho', 'SO', 'Ketlele', 'keht-LEH-leh'),
  ('KET-TS', 'Kettle', 'kettle', 'Setswana', 'TS', 'Ketlele', 'keht-LEH-leh'),

  ('TNG-ZU', 'Tongs', 'tongs', 'Zulu', 'ZU', 'Udlawu', 'oo-DLAH-woo'),
  ('TNG-XH', 'Tongs', 'tongs', 'Xhosa', 'XH', 'Idlawu', 'ee-DLAH-woo'),
  ('TNG-AF', 'Tongs', 'tongs', 'Afrikaans', 'AF', 'Tang', 'tung'),
  ('TNG-SO', 'Tongs', 'tongs', 'Sesotho', 'SO', 'Sekhoele', 'seh-KHWEH-leh'),
  ('TNG-TS', 'Tongs', 'tongs', 'Setswana', 'TS', 'Sekgokelo', 'seh-kho-KEH-loh'),

  ('APR-ZU', 'Apron', 'apron', 'Zulu', 'ZU', 'Ifasikoti', 'ee-fah-see-KOH-tee'),
  ('APR-XH', 'Apron', 'apron', 'Xhosa', 'XH', 'Ifaskoti', 'ee-fah-SKOH-tee'),
  ('APR-AF', 'Apron', 'apron', 'Afrikaans', 'AF', 'Voorskoot', 'FOHR-skoht'),
  ('APR-SO', 'Apron', 'apron', 'Sesotho', 'SO', 'Aporone', 'ah-poh-ROH-neh'),
  ('APR-TS', 'Apron', 'apron', 'Setswana', 'TS', 'Aporone', 'ah-poh-ROH-neh'),

  ('CHM-ZU', 'Chimney Starter', 'chimney-starter', 'Zulu', 'ZU', 'Isilulu Somlilo', 'ee-see-LOO-loo som-DLEE-loh'),
  ('CHM-XH', 'Chimney Starter', 'chimney-starter', 'Xhosa', 'XH', 'Isitya Somlilo', 'ee-SEE-tyah som-LEE-loh'),
  ('CHM-AF', 'Chimney Starter', 'chimney-starter', 'Afrikaans', 'AF', 'Aanmaker', 'AHN-mah-ker'),
  ('CHM-SO', 'Chimney Starter', 'chimney-starter', 'Sesotho', 'SO', 'Sethuseletsi sa Mollo', 'seh-too-seh-LEHT-see sah MOH-loh'),
  ('CHM-TS', 'Chimney Starter', 'chimney-starter', 'Setswana', 'TS', 'Sesimolodi sa Molelo', 'seh-see-moh-LOH-dee sah moh-LEH-loh')
on conflict (id) do update set
  item_name = excluded.item_name,
  item_slug = excluded.item_slug,
  language = excluded.language,
  language_code = excluded.language_code,
  word = excluded.word,
  phonetic = excluded.phonetic;
