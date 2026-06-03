alter table public.daily_care_records
add column if not exists food_amount_grams integer,
add column if not exists food_amount_mode text not null default 'relative'
  check (food_amount_mode in ('relative', 'grams')),
add column if not exists food_amount_level text not null default 'normal'
  check (food_amount_level in ('normal', 'low', 'high', 'none', 'unknown')),
add column if not exists food_brand text,
add column if not exists food_serving_count numeric,
add column if not exists walk_count integer,
add column if not exists walk_minutes integer,
add column if not exists species_care_tags text[] not null default '{}',
add column if not exists custom_care_items text[] not null default '{}';
