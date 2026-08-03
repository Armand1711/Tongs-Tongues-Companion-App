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

insert into public.challenges (theme, starts_at, ends_at)
select
  'Post your braai with your Kettle coaster in the shot',
  date_trunc('month', now()),
  (date_trunc('month', now()) + interval '1 month' - interval '1 second')
where not exists (select 1 from public.challenges where status = 'active');
