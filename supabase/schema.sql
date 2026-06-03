-- PawCare Supabase 初始化脚本
-- 当前创建核心数据表；社区功能请另外运行 supabase/community_schema.sql。
-- 使用方法：复制整份内容到 Supabase SQL Editor，点击 Run。

create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pet-avatars',
  'pet-avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  species text not null,
  breed text,
  gender text,
  birth_date date,
  color text,
  weight_kg decimal(5,2),
  medical_notes text default '无',
  avatar_url text,
  avatar text default '🐾',
  neutered boolean default false,
  vaccinated boolean default false,
  is_public boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.health_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  log_date date not null,
  food_amount integer,
  water_amount integer,
  poop_count integer,
  poop_status text,
  mood text,
  activity_level text,
  weight_kg decimal(5,2),
  symptoms text[] default '{}',
  notes text,
  ai_feedback text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique(pet_id, log_date)
);

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pet_id uuid references public.pets(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamp with time zone not null default now()
);

-- 通用 updated_at 自动更新时间函数。
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_pets_updated_at on public.pets;
create trigger set_pets_updated_at
  before update on public.pets
  for each row execute function public.set_updated_at();

drop trigger if exists set_health_logs_updated_at on public.health_logs;
create trigger set_health_logs_updated_at
  before update on public.health_logs
  for each row execute function public.set_updated_at();

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
alter table public.ai_conversations enable row level security;

-- 清理旧版脚本可能创建过的宽松 policy。
drop policy if exists "Profiles are readable" on public.profiles;
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id);

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
drop policy if exists "Users manage own logs" on public.health_logs;
drop policy if exists "Users manage own health logs" on public.health_logs;
create policy "Users manage own health logs" on public.health_logs
  for all using (
    auth.uid() = user_id
    and pet_id in (
      select id from public.pets where user_id = auth.uid()
    )
  ) with check (
    auth.uid() = user_id
    and pet_id in (
      select id from public.pets where user_id = auth.uid()
    )
  );

drop policy if exists "Users manage own AI conversations" on public.ai_conversations;
create policy "Users manage own AI conversations" on public.ai_conversations
  for all using (
    auth.uid() = user_id
    and (
      pet_id is null
      or pet_id in (
        select id from public.pets where user_id = auth.uid()
      )
    )
  ) with check (
    auth.uid() = user_id
    and (
      pet_id is null
      or pet_id in (
        select id from public.pets where user_id = auth.uid()
      )
    )
  );

drop policy if exists "Anyone reads pet avatars" on storage.objects;
create policy "Anyone reads pet avatars" on storage.objects
  for select using (bucket_id = 'pet-avatars');

drop policy if exists "Users upload own pet avatars" on storage.objects;
create policy "Users upload own pet avatars" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'pet-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users update own pet avatars" on storage.objects;
create policy "Users update own pet avatars" on storage.objects
  for update to authenticated using (
    bucket_id = 'pet-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  ) with check (
    bucket_id = 'pet-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users delete own pet avatars" on storage.objects;
create policy "Users delete own pet avatars" on storage.objects
  for delete to authenticated using (
    bucket_id = 'pet-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
