-- PawCare V1.1：宠物近期待办清单
-- 使用方法：复制整份内容到 Supabase SQL Editor，点击 Run。

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

create table if not exists public.pet_todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  type text not null check (
    type in (
      'vaccine',
      'internal_deworming',
      'external_deworming',
      'checkup',
      'bath',
      'nail',
      'grooming',
      'brushing',
      'ear_cleaning',
      'teeth',
      'weight',
      'medicine',
      'revisit',
      'custom'
    )
  ),
  title text not null,
  category text not null default 'care' check (category in ('health', 'care', 'medicine', 'custom')),
  due_date date not null,
  last_done_date date,
  repeat_days integer,
  is_done boolean not null default false,
  note text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists pet_todos_user_due_idx
  on public.pet_todos (user_id, due_date);

create index if not exists pet_todos_pet_due_idx
  on public.pet_todos (pet_id, due_date);

create index if not exists pet_todos_active_idx
  on public.pet_todos (user_id, pet_id, is_done, due_date);

drop trigger if exists set_pet_todos_updated_at on public.pet_todos;
create trigger set_pet_todos_updated_at
  before update on public.pet_todos
  for each row execute function public.set_updated_at();

alter table public.pet_todos enable row level security;

drop policy if exists "Users manage own pet todos" on public.pet_todos;
create policy "Users manage own pet todos" on public.pet_todos
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
