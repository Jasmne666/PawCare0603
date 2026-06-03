-- PawCare V1.1：今日照护记录表
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

create table if not exists public.daily_care_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  record_date date not null,
  appetite text not null default 'normal' check (appetite in ('normal', 'low', 'high', 'none')),
  water text not null default 'normal' check (water in ('normal', 'low', 'high')),
  stool text not null default 'normal' check (stool in ('normal', 'soft', 'diarrhea', 'constipation', 'bloody')),
  mood text not null default 'normal' check (mood in ('happy', 'normal', 'tired', 'uncomfortable')),
  activity text not null default 'normal' check (activity in ('normal', 'low', 'high')),
  interaction text not null default 'none' check (interaction in ('played', 'walked', 'groomed', 'photo', 'none')),
  abnormal_notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique (pet_id, record_date)
);

create index if not exists daily_care_records_user_date_idx
  on public.daily_care_records (user_id, record_date desc);

create index if not exists daily_care_records_pet_date_idx
  on public.daily_care_records (pet_id, record_date desc);

drop trigger if exists set_daily_care_records_updated_at on public.daily_care_records;
create trigger set_daily_care_records_updated_at
  before update on public.daily_care_records
  for each row execute function public.set_updated_at();

alter table public.daily_care_records enable row level security;

drop policy if exists "Users manage own daily care records" on public.daily_care_records;
create policy "Users manage own daily care records" on public.daily_care_records
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
