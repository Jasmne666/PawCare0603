-- 检查 post-images bucket 是否真的存在
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'post-images';

-- 如果上面的查询没有返回任何行，执行下面这段创建 bucket。
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
