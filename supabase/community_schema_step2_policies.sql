-- PawCare 社区功能 Step 2：创建 RLS 策略
-- 先运行 community_schema_step1_tables.sql，成功后再运行本文件。

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'pets' and policyname = 'Anyone reads public pets') then
    execute 'create policy "Anyone reads public pets" on public.pets for select using (is_public = true)';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'posts' and policyname = 'Anyone reads posts') then
    execute 'create policy "Anyone reads posts" on public.posts for select using (true)';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'posts' and policyname = 'Auth users create own posts') then
    execute $policy$
      create policy "Auth users create own posts" on public.posts
        for insert with check (
          auth.uid() = user_id
          and (
            pet_id is null
            or pet_id in (select id from public.pets where user_id = auth.uid())
          )
        )
    $policy$;
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'posts' and policyname = 'Users manage own posts') then
    execute 'create policy "Users manage own posts" on public.posts for update using (auth.uid() = user_id) with check (auth.uid() = user_id)';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'posts' and policyname = 'Users delete own posts') then
    execute 'create policy "Users delete own posts" on public.posts for delete using (auth.uid() = user_id)';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'post_likes' and policyname = 'Users read own likes') then
    execute 'create policy "Users read own likes" on public.post_likes for select using (auth.uid() = user_id)';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'post_likes' and policyname = 'Users manage own likes') then
    execute 'create policy "Users manage own likes" on public.post_likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id)';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'comments' and policyname = 'Anyone reads comments') then
    execute 'create policy "Anyone reads comments" on public.comments for select using (true)';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'comments' and policyname = 'Users manage own comments') then
    execute 'create policy "Users manage own comments" on public.comments for all using (auth.uid() = user_id) with check (auth.uid() = user_id)';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'pet_follows' and policyname = 'Users read own follows') then
    execute 'create policy "Users read own follows" on public.pet_follows for select using (auth.uid() = follower_id)';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'pet_follows' and policyname = 'Users manage own follows') then
    execute $policy$
      create policy "Users manage own follows" on public.pet_follows
        for all using (auth.uid() = follower_id)
        with check (
          auth.uid() = follower_id
          and following_pet_id in (select id from public.pets where is_public = true)
        )
    $policy$;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Anyone reads post images') then
    execute 'create policy "Anyone reads post images" on storage.objects for select using (bucket_id = ''post-images'')';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users upload own post images') then
    execute $policy$
      create policy "Users upload own post images" on storage.objects
        for insert to authenticated with check (
          bucket_id = 'post-images'
          and auth.uid()::text = (storage.foldername(name))[1]
        )
    $policy$;
  end if;
end $$;
