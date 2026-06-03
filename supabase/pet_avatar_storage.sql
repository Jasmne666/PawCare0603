-- PawCare 宠物头像存储配置
-- 使用方法：复制整份内容到 Supabase SQL Editor，点击 Run。
-- 这份脚本只创建 Storage bucket 和头像访问策略，不会删除任何业务表。

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

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Anyone reads pet avatars'
  ) then
    execute $policy$
      create policy "Anyone reads pet avatars" on storage.objects
        for select using (bucket_id = 'pet-avatars')
    $policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users upload own pet avatars'
  ) then
    execute $policy$
      create policy "Users upload own pet avatars" on storage.objects
        for insert to authenticated with check (
          bucket_id = 'pet-avatars'
          and auth.uid()::text = (storage.foldername(name))[1]
        )
    $policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users update own pet avatars'
  ) then
    execute $policy$
      create policy "Users update own pet avatars" on storage.objects
        for update to authenticated using (
          bucket_id = 'pet-avatars'
          and auth.uid()::text = (storage.foldername(name))[1]
        ) with check (
          bucket_id = 'pet-avatars'
          and auth.uid()::text = (storage.foldername(name))[1]
        )
    $policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users delete own pet avatars'
  ) then
    execute $policy$
      create policy "Users delete own pet avatars" on storage.objects
        for delete to authenticated using (
          bucket_id = 'pet-avatars'
          and auth.uid()::text = (storage.foldername(name))[1]
        )
    $policy$;
  end if;
end $$;
