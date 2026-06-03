alter table public.profiles
add column if not exists pet_relation_name text default '主人';
