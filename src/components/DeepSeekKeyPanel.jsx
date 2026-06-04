import { useState } from 'react';
import { getDeepSeekApiKey } from '../lib/deepseek.js';

function DeepSeekKeyPanel({ onKeySaved, petName = '宠物', variant = 'default' }) {
  const [showInput, setShowInput] = useState(false);
  const [draft, setDraft] = useState('');
  const [hasKey, setHasKey] = useState(Boolean(getDeepSeekApiKey()));

  const saveKey = () => {
    const nextKey = draft.trim();
    localStorage.setItem('pawcare_deepseek_key', nextKey);
    setDraft('');
    setHasKey(Boolean(nextKey));
    setShowInput(false);
    onKeySaved?.(nextKey);
  };

  if (variant === 'ai') {
    if (hasKey) return null;

    return (
      <section className="rounded-card border border-paw-border bg-[#F5EFE0] p-4">
        <p className="text-sm font-semibold text-paw-primary">✨ 开启你的AI宠物顾问</p>
        <p className="mt-2 text-xs leading-5 text-paw-secondary">
          填写API密钥即可开始分析{petName}的健康状况，每次分析费用约¥0.002
        </p>
        <a
          className="mt-2 inline-flex text-xs font-semibold text-paw-healthy"
          href="https://platform.deepseek.com"
          rel="noreferrer"
          target="_blank"
        >
          没有密钥？点这里免费申请 →
        </a>
        <div className="mt-4 flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-control border border-paw-border bg-paw-card px-3 py-2 text-xs outline-none focus:border-paw-healthy"
            onChange={(event) => setDraft(event.target.value)}
            placeholder="sk-..."
            type="password"
            value={draft}
          />
          <button
            className="rounded-control bg-paw-primary px-4 py-2 text-xs font-semibold text-paw-background disabled:opacity-50"
            disabled={!draft.trim()}
            onClick={saveKey}
            type="button"
          >
            立即开启
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-paw-primary">DeepSeek 即时反馈</p>
          <p className="mt-1 text-xs leading-5 text-paw-muted">
            {hasKey ? '已配置本地 API Key，保存记录后会生成反馈。' : '未配置 Key 时，记录仍会正常保存。'}
          </p>
        </div>
        <button
          className="rounded-control border border-paw-border px-3 py-2 text-xs font-semibold text-paw-secondary"
          onClick={() => setShowInput((current) => !current)}
          type="button"
        >
          {hasKey ? '更新' : '填写'}
        </button>
      </div>

      {showInput && (
        <div className="mt-3 flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-control border border-paw-border bg-paw-background px-3 py-2 text-xs outline-none focus:border-paw-healthy"
            onChange={(event) => setDraft(event.target.value)}
            placeholder="sk-..."
            type="password"
            value={draft}
          />
          <button
            className="rounded-control bg-paw-primary px-3 py-2 text-xs font-semibold text-paw-background"
            onClick={saveKey}
            type="button"
          >
            保存
          </button>
        </div>
      )}
    </section>
  );
}

export default DeepSeekKeyPanel;
