# Supabase 初始化说明

当前文件夹用于保存 PawCare 的 Supabase 数据库脚本。

## 第一次建表

1. 打开 Supabase Dashboard。
2. 进入 PawCare 项目。
3. 左侧打开 `SQL Editor`。
4. 新建一个 query。
5. 复制 `schema.sql` 的全部内容。
6. 粘贴到 SQL Editor。
7. 点击 `Run`。

执行成功后，左侧 `Table Editor` 里应该能看到：

- `profiles`
- `pets`
- `health_logs`
- `posts`
- `post_likes`
- `comments`
- `pet_follows`
- `ai_conversations`

## 注意

- 不要把 `.env.local` 上传到 GitHub。
- `VITE_SUPABASE_ANON_KEY` 可以放前端。
- `service_role` key 绝对不要放前端。
- `VITE_DEEPSEEK_KEY` 当前阶段可以留空。
