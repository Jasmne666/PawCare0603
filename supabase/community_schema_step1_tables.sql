-- PawCare 社区功能 Step 1：先创建表、触发器、Storage bucket
-- 使用方法：复制整份内容到 Supabase SQL Editor，确保没有选中局部文本，然后点击 Run。

create extension if not exists pgcrypto;

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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images',
  'post-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pet_id uuid references public.pets(id) on delete set null,
  content text not null,
  images text[] default '{}',
  post_type text not null default 'normal' check (post_type in ('normal', 'cloud_walk')),
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone not null default now()
);

alter table public.comments
  add column if not exists parent_comment_id uuid references public.comments(id) on delete cascade;

create table if not exists public.pet_follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_pet_id uuid not null references public.pets(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  primary key (follower_id, following_pet_id)
);

alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.comments enable row level security;
alter table public.pet_follows enable row level security;

create or replace function public.update_post_likes_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set likes_count = likes_count + 1 where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.posts set likes_count = greatest(likes_count - 1, 0) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

create or replace function public.update_post_comments_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set comments_count = comments_count + 1 where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.posts set comments_count = greatest(comments_count - 1, 0) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'post_likes_count_trigger') then
    create trigger post_likes_count_trigger
      after insert or delete on public.post_likes
      for each row execute function public.update_post_likes_count();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'comments_count_trigger') then
    create trigger comments_count_trigger
      after insert or delete on public.comments
      for each row execute function public.update_post_comments_count();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'set_posts_updated_at') then
    create trigger set_posts_updated_at
      before update on public.posts
      for each row execute function public.set_updated_at();
  end if;
end $$;
