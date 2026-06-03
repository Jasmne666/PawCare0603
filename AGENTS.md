# AGENTS.md — PawCare 项目指南

> 这个文件是 Codex 的行动手册。每次执行任务前请完整读取。

---

## 🐾 项目是什么

PawCare 是一款面向中国大陆用户的 AI 宠物健康管家 + 宠物社区 Web App。

核心逻辑：用户每天记录宠物的饮食/饮水/排便/心情数据 → AI（DeepSeek）自动分析并给出健康提醒 → 社区功能让宠物主交友互动，不养宠物的人也能"云遛宠"参与。

---

## 🛠 技术栈（不得更换）

| 层级 | 技术 |
|------|------|
| 前端框架 | React + Vite |
| 样式 | Tailwind CSS |
| 路由 | react-router-dom v6 |
| 数据库 + 认证 | Supabase |
| AI API | DeepSeek（`https://api.deepseek.com/chat/completions`） |
| 图片存储 | Supabase Storage |
| 部署 | Vercel |

---

## 📁 目录结构（必须遵守）

```
pawcare/
├── public/
├── src/
│   ├── components/      # 可复用组件
│   ├── pages/           # 页面组件
│   ├── hooks/           # 自定义 hooks
│   ├── lib/             # supabase.js 等第三方配置
│   ├── utils/           # 工具函数
│   └── App.jsx
├── AGENTS.md            # 本文件
├── .env.local           # 环境变量（不提交 git）
└── vercel.json
```

---

## 🎨 设计规范（所有 UI 必须遵守）

```
背景色：#FDFAF4（米白）
卡片色：#FFFFFF（纯白）
边框色：#DDD3C4
主色（按钮/强调）：#2C1810（深棕）
次主色：#5C3D2E
健康/正常：#4A7C59（鼠尾草绿）
警示/偏少：#E8A020（琥珀）
异常/危险：#D95F5F（玫瑰红）
文字静默色：#9E8E82

标题字体：'Playfair Display', serif
正文字体：'DM Sans', sans-serif
圆角-卡片：16px ~ 20px
圆角-按钮/输入框：8px ~ 12px
最大宽度：480px，水平居中
```

在 index.html 的 `<head>` 里引入字体：
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
```

---

## 💻 编码规范（必须遵守）

- 所有注释写中文
- 每个组件文件不超过 200 行，超过则拆分
- 不使用 class 组件，全部用函数组件 + hooks
- 异步操作统一用 async/await，加 try/catch
- Supabase 所有操作封装在 `src/lib/` 或 `src/hooks/` 里，页面组件不直接写 Supabase 调用
- 环境变量统一从 `import.meta.env.VITE_XXX` 读取

---

## 🗄 数据库结构（Supabase）

> 所有表已在 Supabase 创建，以下是结构参考，不要重复建表。

### profiles（用户资料）
```sql
id uuid references auth.users primary key
username text unique not null
avatar_url text
bio text
created_at timestamp default now()
```

### pets（宠物档案）
```sql
id uuid primary key default gen_random_uuid()
user_id uuid references profiles(id) on delete cascade
name text not null
species text not null        -- 猫/狗/兔子/仓鼠/其他
breed text
birthday date
weight decimal(4,2)
color text
avatar text                  -- emoji字符，如 🐱
diseases text default '无'
neutered boolean default false
vaccinated boolean default false
is_public boolean default false
created_at timestamp default now()
```

### health_logs（每日健康记录）
```sql
id uuid primary key default gen_random_uuid()
pet_id uuid references pets(id) on delete cascade
log_date date not null
food_amount integer           -- 克
water_amount integer          -- 毫升
poop_count integer            -- 次数
weight decimal(4,2)
mood text                     -- 😊😐😞🤒😨
symptoms text[]               -- ['食欲不振','精神萎靡']
notes text
ai_feedback text              -- 保存后AI即时反馈
created_at timestamp default now()
unique(pet_id, log_date)
```

### posts（社区帖子）
```sql
id uuid primary key default gen_random_uuid()
user_id uuid references profiles(id) on delete cascade
pet_id uuid references pets(id)
content text not null
images text[]
post_type text default 'normal'   -- normal / cloud_walk
likes_count integer default 0
comments_count integer default 0
created_at timestamp default now()
```

### post_likes / comments / pet_follows
```sql
-- post_likes: post_id + user_id，unique组合
-- comments: post_id + user_id + content
-- pet_follows: follower_id + following_pet_id，unique组合
```

---

## 🗺 页面路由

```
/           → Home.jsx      首页（健康总览）
/log        → Log.jsx       每日记录
/ai         → AI.jsx        AI 健康顾问对话
/history    → History.jsx   历史记录列表
/profile    → Profile.jsx   宠物档案管理
/community  → Community.jsx 社区广场
/cloud      → Cloud.jsx     云遛宠
/login      → Login.jsx     登录注册
```

底部导航组件 `BottomNav.jsx` 在所有登录后页面显示，包含：首页 / 记录 / AI / 历史 / 档案。

---

## 🤖 DeepSeek API 调用方式

```javascript
// 统一封装在 src/lib/deepseek.js
const callDeepSeek = async (systemPrompt, userMessage, apiKey) => {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      max_tokens: 800,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
};
```

AI 功能出现在三个地方：
1. **记录保存后**：自动调用，生成 1-2 句即时反馈，写回 `ai_feedback` 字段
2. **首页提醒横幅**：点击后跳转 AI 页并自动带入问题
3. **AI 对话页**：自由对话，每次自动拼接宠物档案 + 最近 5 天记录作为上下文

AI 系统提示词（固定用这个）：
```
你是一位专业温柔的宠物健康顾问，有丰富的兽医学知识。
根据用户提供的宠物数据进行分析，给出具体实用的建议。
语气像朋友一样温暖，善用emoji，回复控制在300字以内，用中文回答。
```

---

## 🏥 健康评分算法

```javascript
// src/utils/healthScore.js
export function calcHealthScore(logs) {
  if (!logs.length) return 80;
  let score = 90;
  const last3 = logs.slice(0, 3);
  last3.forEach(log => {
    if (parseInt(log.food_amount) < 100) score -= 8;
    if (parseInt(log.water_amount) < 180) score -= 5;
    if (parseInt(log.poop_count) < 1) score -= 6;
    if (log.mood === '🤒') score -= 12;
    if (log.mood === '😞') score -= 6;
    if (log.symptoms?.length > 0) score -= log.symptoms.length * 3;
  });
  return Math.max(30, Math.min(99, score));
}
// 分数颜色：>=80 → #4A7C59，>=60 → #E8A020，<60 → #D95F5F
```

---

## ⚠️ 首页智能提醒规则

```javascript
// src/utils/alerts.js
// 根据宠物信息和最近记录，返回提醒数组
// 每条提醒：{ type: 'warn'|'danger', icon, title, desc, question }
// question 字段：点击提醒跳转 AI 页时自动发送的问题

const alerts = [];
const ageMonths = Math.floor((Date.now() - new Date(pet.birthday)) / 2592000000);

if (!pet.neutered && ageMonths >= 10 && ageMonths <= 14)
  alerts.push({ type: 'warn', icon: '✂️', title: '绝育时间到了',
    desc: `${pet.name}已${calcAge(pet.birthday)}，建议尽快预约兽医安排绝育。`,
    question: '现在适合给豆豆做绝育手术吗？有什么需要提前准备的？' });

if (recentLogs[0] && parseInt(recentLogs[0].food_amount) < 100)
  alerts.push({ type: 'danger', icon: '🍽️', title: '进食量明显偏少',
    desc: '今天进食不足正常水平60%，请关注是否有其他异常症状。',
    question: '豆豆今天进食量很少，请帮我分析原因和应对方法。' });

if (recentLogs[0] && parseInt(recentLogs[0].water_amount) < 180)
  alerts.push({ type: 'warn', icon: '💧', title: '饮水量偏少',
    desc: '饮水不足可能导致泌尿系统问题，建议检查饮水碗。',
    question: '豆豆最近饮水量减少，这会有什么健康影响？' });
```

---

## 📋 Supabase RLS 策略（必须配置，否则数据读不出来）

执行以下 SQL（在 Supabase SQL Editor 里运行）：
```sql
-- 用户只能管理自己的宠物
create policy "Users manage own pets" on pets
  for all using (auth.uid() = user_id);

-- 用户只能管理自己的健康记录
create policy "Users manage own logs" on health_logs
  for all using (
    pet_id in (select id from pets where user_id = auth.uid())
  );

-- 所有人可以读社区帖子
create policy "Anyone reads posts" on posts
  for select using (true);

-- 登录用户可以发帖
create policy "Auth users post" on posts
  for insert with check (auth.uid() = user_id);

-- 用户管理自己的点赞
create policy "Users manage own likes" on post_likes
  for all using (auth.uid() = user_id);
```

---

## 🚀 开发阶段和任务顺序

每次只处理一个阶段，完成并通过验证后再进入下一阶段。

### 阶段 1：项目骨架
- 用 Vite 创建 React 项目，安装所有依赖
- 配置 Tailwind CSS
- 创建所有页面文件（内容空着）
- 创建 BottomNav 组件
- 配置 react-router-dom 路由
- 创建 vercel.json（SPA 路由支持）

验证：`npm run dev` 能启动，所有路由能访问，底部导航能切换页面。

### 阶段 2：登录注册
- 创建 `src/lib/supabase.js`
- 实现 Login.jsx（邮箱+密码）
- 实现 `src/hooks/useAuth.js`（未登录跳转 /login）

验证：能注册新用户，能登录，登录后跳转首页。

### 阶段 3：宠物档案
- 实现 Profile.jsx
- 实现 `src/utils/petAge.js`（计算年龄）
- 读写 Supabase pets 表

验证：能保存宠物信息，刷新后数据还在。

### 阶段 4：每日记录 + AI 即时反馈
- 实现 Log.jsx（所有表单字段）
- 创建 `src/lib/deepseek.js`
- 保存记录后调用 DeepSeek，写回 ai_feedback

验证：保存记录后顶部出现 AI 反馈气泡，Supabase 里能看到写入的数据。

### 阶段 5：首页 + AI 对话页
- 实现 Home.jsx（所有模块）
- 实现 AI.jsx（对话界面）
- 实现 `src/utils/healthScore.js`
- 实现 `src/utils/alerts.js`

验证：首页健康分数显示正确，提醒横幅点击后跳转 AI 页并自动发送问题。

### 阶段 6：历史记录页
- 实现 History.jsx
- 支持筛选（全部/有异常/😊/🤒）

验证：历史记录按日期倒序显示，筛选功能正常。

### 阶段 7：社区功能
- 实现 Community.jsx（广场/关注/Tab切换）
- 实现发帖弹窗 + 图片上传到 Supabase Storage
- 实现点赞（乐观更新）
- 实现宠物关注功能
- 实现 Cloud.jsx（云遛宠频道）

验证：能发帖、点赞、关注宠物，云遛帖子在独立频道显示。

### 阶段 8：上线优化
- 所有数据加载加骨架屏
- 统一错误处理（Toast 提示）
- 空状态处理
- 手机适配（320px-430px）
- Vercel 环境变量配置

验证：部署到 Vercel，手机浏览器访问正常。

---

## 🔑 环境变量清单

```
VITE_SUPABASE_URL=       # Supabase 项目 URL
VITE_SUPABASE_ANON_KEY=  # Supabase anon key
VITE_DEEPSEEK_KEY=       # DeepSeek API Key（用户也可在 App 内自行设置）
```

---

## ❌ 常见坑，遇到时对照处理

**Supabase 数据读不出来** → 检查 RLS 策略是否已按上面的 SQL 配置

**DeepSeek 跨域报错（上线后）** → 把 DeepSeek 调用改成通过 Supabase Edge Function 中转

**图片上传后不显示** → 在 Supabase Storage → Policies 把存储桶设为公开读取

**手机上字体太小** → 检查 index.html 是否有 `<meta name="viewport" content="width=device-width, initial-scale=1.0">`

**登录后刷新页面状态丢失** → 用 `supabase.auth.onAuthStateChange` 监听状态，存入 React Context

---

## 📝 每次给 Codex 新任务时附上这句话

> "请阅读 AGENTS.md，按照其中的技术栈、设计规范和编码规范来完成任务。
>  当前处于阶段X，任务是：[粘贴对应阶段的内容]。
>  完成后告诉我改动了哪些文件，以及如何验证结果。"
