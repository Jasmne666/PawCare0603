-- PawCare 社区评论回复补丁
-- 你已经成功运行社区 Step 1/Step 2 后，只需要额外运行这一份。

alter table public.comments
  add column if not exists parent_comment_id uuid references public.comments(id) on delete cascade;
