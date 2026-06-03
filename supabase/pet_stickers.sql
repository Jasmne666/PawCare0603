create table if not exists public.pet_stickers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  captured_date date not null,
  title text,
  note text,
  original_image_url text not null,
  sticker_image_url text,
  processing_status text not null default 'fallback'
    check (processing_status in ('pending', 'processed', 'failed', 'fallback')),
  is_favorite boolean not null default false,
  is_public boolean not null default false,
  cloud_post_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pet_stickers_user_date_idx
  on public.pet_stickers(user_id, captured_date desc);

create index if not exists pet_stickers_pet_date_idx
  on public.pet_stickers(pet_id, captured_date desc);

create index if not exists pet_stickers_user_pet_date_idx
  on public.pet_stickers(user_id, pet_id, captured_date desc);

create or replace function public.set_pet_stickers_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_pet_stickers_updated_at on public.pet_stickers;
create trigger set_pet_stickers_updated_at
before update on public.pet_stickers
for each row execute function public.set_pet_stickers_updated_at();

alter table public.pet_stickers enable row level security;

drop policy if exists "Users manage own stickers" on public.pet_stickers;
create policy "Users manage own stickers"
on public.pet_stickers
for all
using (
  auth.uid() = user_id
  and pet_id in (select id from public.pets where user_id = auth.uid())
)
with check (
  auth.uid() = user_id
  and pet_id in (select id from public.pets where user_id = auth.uid())
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('pet-sticker-originals', 'pet-sticker-originals', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('pet-stickers', 'pet-stickers', true, 10485760, array['image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users upload own sticker originals" on storage.objects;
create policy "Users upload own sticker originals"
on storage.objects
for insert
with check (
  bucket_id = 'pet-sticker-originals'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users upload own stickers" on storage.objects;
create policy "Users upload own stickers"
on storage.objects
for insert
with check (
  bucket_id = 'pet-stickers'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users update own sticker files" on storage.objects;
create policy "Users update own sticker files"
on storage.objects
for update
using (
  bucket_id in ('pet-sticker-originals', 'pet-stickers')
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users delete own sticker files" on storage.objects;
create policy "Users delete own sticker files"
on storage.objects
for delete
using (
  bucket_id in ('pet-sticker-originals', 'pet-stickers')
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Public reads sticker files" on storage.objects;
create policy "Public reads sticker files"
on storage.objects
for select
using (bucket_id in ('pet-sticker-originals', 'pet-stickers'));
