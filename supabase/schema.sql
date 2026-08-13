create extension if not exists "pgcrypto";

create table if not exists public.cards (
  id text primary key,
  item_name text not null,
  item_slug text not null,
  language text not null,
  language_code text not null,
  word text not null,
  phonetic text not null,
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

drop policy if exists "cards are readable by everyone" on public.cards;
create policy "cards are readable by everyone"
  on public.cards for select
  using (true);

drop policy if exists "users can read own collections" on public.user_collections;
create policy "users can read own collections"
  on public.user_collections for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert own collections" on public.user_collections;
create policy "users can insert own collections"
  on public.user_collections for insert
  with check (auth.uid() = user_id);

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

drop policy if exists "users can update own posts" on public.posts;
create policy "users can update own posts"
  on public.posts for update
  using (auth.uid() = user_id)
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

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  theme text not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.posts add column if not exists challenge_id uuid references public.challenges (id);
alter table public.posts add column if not exists display_name text;

drop view if exists public.posts_with_votes;
create view public.posts_with_votes as
select
  p.id,
  p.user_id,
  p.image_url,
  p.caption,
  p.created_at,
  count(v.id) as vote_count,
  p.display_name,
  p.challenge_id
from public.posts p
left join public.votes v on v.post_id = p.id
group by p.id;

create unique index if not exists challenges_one_active_idx
  on public.challenges ((true)) where status = 'active';

drop index if exists public.posts_challenge_user_idx;
create unique index posts_challenge_user_idx
  on public.posts (challenge_id, user_id);

create table if not exists public.voucher_codes (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now(),
  unique (challenge_id)
);

alter table public.challenges enable row level security;
alter table public.voucher_codes enable row level security;

drop policy if exists "challenges are readable by everyone" on public.challenges;
create policy "challenges are readable by everyone"
  on public.challenges for select
  using (true);

drop policy if exists "users can read own vouchers" on public.voucher_codes;
create policy "users can read own vouchers"
  on public.voucher_codes for select
  using (auth.uid() = user_id);

create or replace function public.close_challenge_if_due()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  due_challenge record;
  winning_post record;
  new_code text;
begin
  select * into due_challenge
  from public.challenges
  where status = 'active' and ends_at <= now()
  limit 1
  for update skip locked;

  if not found then
    return;
  end if;

  select p.id, p.user_id into winning_post
  from public.posts p
  left join public.votes v on v.post_id = p.id
  where p.challenge_id = due_challenge.id
  group by p.id, p.user_id
  order by count(v.id) desc, p.created_at asc
  limit 1;

  if found then
    new_code := 'WEBER-BRAAI-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
    insert into public.voucher_codes (challenge_id, post_id, user_id, code)
    values (due_challenge.id, winning_post.id, winning_post.user_id, new_code)
    on conflict (challenge_id) do nothing;
  end if;

  update public.challenges set status = 'closed' where id = due_challenge.id;
end;
$$;

grant execute on function public.close_challenge_if_due() to authenticated;

drop view if exists public.hall_of_fame;
create view public.hall_of_fame as
select
  c.id as challenge_id,
  c.theme,
  c.ends_at,
  p.id as post_id,
  p.image_url,
  p.caption,
  p.display_name,
  vc.created_at as won_at
from public.voucher_codes vc
join public.challenges c on c.id = vc.challenge_id
join public.posts p on p.id = vc.post_id
order by c.ends_at desc;

-- Real card catalog: 9 independent braai-phrase coasters, 3 per language
-- (Zulu, Xhosa, Afrikaans) — not one concept translated 3 ways, so
-- item_slug is now unique per coaster rather than shared across languages.
-- item_name holds the dish shown on the coaster; `word` is the phrase as
-- lettered on the art; `phonetic` is repurposed to hold an English gloss of
-- the phrase (best-effort translation — confirm/correct before print).
-- image_url points at the source art copied into public/coasters/.
delete from public.cards
where item_slug not in (
  'zulu-kumnandi', 'zulu-kungithinta', 'zulu-iyavaya',
  'xhosa-mncwaa', 'xhosa-phuma-phambili', 'xhosa-lumnandi',
  'afrikaans-engel-piepie', 'afrikaans-jy-lyk-so-lekker', 'afrikaans-koue-een'
);

insert into public.cards (id, item_name, item_slug, language, language_code, word, phonetic, image_url) values
  ('ZU-01', 'Pap & Chakalaka', 'zulu-kumnandi', 'Zulu', 'ZU', 'Kumnandi! Kumnandi! Kumnandi!', 'It''s delicious! It''s delicious! It''s delicious!', '/coasters/zulu-kumnandi.jpg'),
  ('ZU-02', 'Sunday Plate', 'zulu-kungithinta', 'Zulu', 'ZU', 'Kungithinta Ngaphakathi!', 'It touches me on the inside!', '/coasters/zulu-kungithinta.jpg'),
  ('ZU-03', 'Pap & Braai Meat', 'zulu-iyavaya', 'Zulu', 'ZU', 'IyaVaya', 'It''s popping / it''s going off', '/coasters/zulu-iyavaya.jpg'),

  ('XH-01', 'Steamed Bread & Beans', 'xhosa-mncwaa', 'Xhosa', 'XH', 'Mncwaa! Mncwaa!', 'Nom nom! (the sound of eating with relish)', '/coasters/xhosa-mncwaa.jpg'),
  ('XH-02', 'Umngqusho (Samp)', 'xhosa-phuma-phambili', 'Xhosa', 'XH', 'Yho, Phuma Phambili!', 'Whoa, come out on top!', '/coasters/xhosa-phuma-phambili.jpg'),
  ('XH-03', 'Pap & Tripe', 'xhosa-lumnandi', 'Xhosa', 'XH', 'Lumnandi!', 'It''s delicious!', '/coasters/xhosa-lumnandi.jpg'),

  ('AF-01', 'Steak Sandwich', 'afrikaans-engel-piepie', 'Afrikaans', 'AF', 'Joh! Smaak Soos Engel Piepie!', 'Whoa! Tastes like angel wee! (i.e. amazing)', '/coasters/afrikaans-engel-piepie.jpg'),
  ('AF-02', 'Braai Chicken', 'afrikaans-jy-lyk-so-lekker', 'Afrikaans', 'AF', 'Jy Lyk So Lekker', 'You look so delicious', '/coasters/afrikaans-jy-lyk-so-lekker.jpg'),
  ('AF-03', 'Brandy & Coke', 'afrikaans-koue-een', 'Afrikaans', 'AF', 'Tyd vir ''n Koue Een!', 'Time for a cold one!', '/coasters/afrikaans-koue-een.jpg')
on conflict (id) do update set
  item_name = excluded.item_name,
  item_slug = excluded.item_slug,
  language = excluded.language,
  language_code = excluded.language_code,
  word = excluded.word,
  phonetic = excluded.phonetic,
  image_url = excluded.image_url;

insert into public.challenges (theme, starts_at, ends_at)
select
  'Post your braai with your coaster in the shot',
  date_trunc('month', now()),
  (date_trunc('month', now()) + interval '1 month' - interval '1 second')
where not exists (select 1 from public.challenges where status = 'active');

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  display_name text,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists comments_post_id_idx on public.comments (post_id, created_at);

alter table public.comments enable row level security;

drop policy if exists "comments are readable by everyone" on public.comments;
create policy "comments are readable by everyone"
  on public.comments for select
  using (true);

drop policy if exists "users can insert own comments" on public.comments;
create policy "users can insert own comments"
  on public.comments for insert
  with check (auth.uid() = user_id);
