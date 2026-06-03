-- PawCare Supabase 初始化脚本
-- 使用方法：复制整份内容到 Supabase SQL Editor，点击 Run。

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default now()
);

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  species text not null,
  breed text,
  birthday date,
  weight decimal(4,2),
  color text,
  avatar text,
  diseases text default '无',
  neutered boolean default false,
  vaccinated boolean default false,
  is_public boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists public.health_logs (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references public.pets(id) on delete cascade not null,
  log_date date not null,
  food_amount integer,
  water_amount integer,
  poop_count integer,
  weight decimal(4,2),
  mood text,
  symptoms text[],
  notes text,
  ai_feedback text,
  created_at timestamp with time zone default now(),
  unique(pet_id, log_date)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  pet_id uuid references public.pets(id) on delete set null,
  content text not null,
  images text[],
  post_type text default 'normal',
  likes_count integer default 0,
  comments_count integer default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(post_id, user_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default now()
);

create table if not exists public.pet_follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_pet_id uuid references public.pets(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(follower_id, following_pet_id)
);

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  pet_id uuid references public.pets(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default now()
);

-- 注册用户后自动创建 profiles 记录。
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(nullif(split_part(new.email, '@', 1), ''), 'user') || '_' || substr(new.id::text, 1, 8),
    null
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 给已经注册过的用户补 profiles 记录。
insert into public.profiles (id, username, avatar_url)
select
  id,
  coalesce(nullif(split_part(email, '@', 1), ''), 'user') || '_' || substr(id::text, 1, 8),
  null
from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.pets enable row level security;
alter table public.health_logs enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.comments enable row level security;
alter table public.pet_follows enable row level security;
alter table public.ai_conversations enable row level security;

drop policy if exists "Profiles are readable" on public.profiles;
create policy "Profiles are readable" on public.profiles
  for select using (true);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users manage own pets" on public.pets;
create policy "Users manage own pets" on public.pets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Anyone reads public pets" on public.pets;
create policy "Anyone reads public pets" on public.pets
  for select using (is_public = true or auth.uid() = user_id);

drop policy if exists "Users manage own logs" on public.health_logs;
create policy "Users manage own logs" on public.health_logs
  for all using (
    pet_id in (select id from public.pets where user_id = auth.uid())
  ) with check (
    pet_id in (select id from public.pets where user_id = auth.uid())
  );

drop policy if exists "Anyone reads posts" on public.posts;
create policy "Anyone reads posts" on public.posts
  for select using (true);

drop policy if exists "Auth users post" on public.posts;
create policy "Auth users post" on public.posts
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own posts" on public.posts;
create policy "Users update own posts" on public.posts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users delete own posts" on public.posts;
create policy "Users delete own posts" on public.posts
  for delete using (auth.uid() = user_id);

drop policy if exists "Anyone reads likes" on public.post_likes;
create policy "Anyone reads likes" on public.post_likes
  for select using (true);

drop policy if exists "Users manage own likes" on public.post_likes;
create policy "Users manage own likes" on public.post_likes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Anyone reads comments" on public.comments;
create policy "Anyone reads comments" on public.comments
  for select using (true);

drop policy if exists "Auth users comment" on public.comments;
create policy "Auth users comment" on public.comments
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users manage own comments" on public.comments;
create policy "Users manage own comments" on public.comments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users delete own comments" on public.comments;
create policy "Users delete own comments" on public.comments
  for delete using (auth.uid() = user_id);

drop policy if exists "Anyone reads follows" on public.pet_follows;
create policy "Anyone reads follows" on public.pet_follows
  for select using (true);

drop policy if exists "Users manage own follows" on public.pet_follows;
create policy "Users manage own follows" on public.pet_follows
  for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);

drop policy if exists "Users manage own AI conversations" on public.ai_conversations;
create policy "Users manage own AI conversations" on public.ai_conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
