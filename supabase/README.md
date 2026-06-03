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

执行成功后，左侧 `Table Editor` 里应该能看到当前阶段需要的 4 张表：

- `profiles`
- `pets`
- `health_logs`
- `ai_conversations`

社区相关表会在阶段 7 再创建，当前不要提前建。

## 注意

- 不要把 `.env.local` 上传到 GitHub。
- `VITE_SUPABASE_ANON_KEY` 可以放前端。
- `service_role` key 绝对不要放前端。
- `VITE_DEEPSEEK_KEY` 当前阶段可以留空。
