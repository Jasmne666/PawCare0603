-- PawCare：扩展 pet_todos 待办类型
-- 使用方法：如果已经创建过 pet_todos 表，请复制整份内容到 Supabase SQL Editor 执行。

alter table public.pet_todos
  drop constraint if exists pet_todos_type_check;

alter table public.pet_todos
  add constraint pet_todos_type_check check (
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
      'habitat_cleaning',
      'walk',
      'sand_bath',
      'feather_check',
      'shed_check',
      'water_change',
      'medicine',
      'revisit',
      'custom'
    )
  );
