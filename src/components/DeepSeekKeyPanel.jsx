import { useState } from 'react';
import { getDeepSeekApiKey } from '../lib/deepseek.js';

function DeepSeekKeyPanel() {
  const [showInput, setShowInput] = useState(false);
  const [draft, setDraft] = useState('');
  const [hasKey, setHasKey] = useState(Boolean(getDeepSeekApiKey()));

  const saveKey = () => {
    localStorage.setItem('pawcare_deepseek_key', draft.trim());
    setDraft('');
    setHasKey(Boolean(draft.trim()));
    setShowInput(false);
  };

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
