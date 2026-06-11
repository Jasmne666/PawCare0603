import { useEffect, useState } from 'react';
import {
  getQuickRecordStampName,
  quickHealthRecordGroups,
} from '../data/quickHealthRecordOptions.js';

function OptionButton({ active, label, onClick }) {
  return (
    <button
      className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
        active
          ? 'border-paw-healthy bg-paw-healthy/10 text-paw-healthy'
          : 'border-paw-border bg-paw-background text-paw-muted'
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function HomeQuickRecordCard({ hasTodayLog, onSave, petName, saving }) {
  const [expanded, setExpanded] = useState(false);
  const [notice, setNotice] = useState('');
  const [selection, setSelection] = useState({
    food: 'normal',
    mood: 'active',
    poop: 'normal',
    water: 'normal',
  });

  useEffect(() => {
    setNotice('');
    setExpanded(false);
  }, [petName]);

  const setGroupValue = (groupId, value) => {
    setNotice('');
    setSelection((current) => ({ ...current, [groupId]: value }));
  };

  const handleSave = async () => {
    const stampName = getQuickRecordStampName(selection);
    await onSave(selection);
    setNotice(`${petName}今天获得「${stampName}」🐾`);
    setExpanded(false);
  };

  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-paw-muted">30 秒快捷记录</p>
          <h2 className="mt-1 font-title text-xl font-semibold text-paw-primary">
            {hasTodayLog ? '继续更新今天' : '记录今天'}
          </h2>
          <p className="mt-1 text-xs leading-5 text-paw-muted">
            吃饭、喝水、便便和精神先快速打卡，详细内容可以去记录页补充。
          </p>
        </div>
        <button
          className="shrink-0 rounded-control bg-paw-primary px-4 py-2.5 text-xs font-semibold text-paw-background"
          onClick={() => setExpanded((current) => !current)}
          type="button"
        >
          {expanded ? '收起' : '记录今天'}
        </button>
      </div>

      {notice && (
        <p className="mt-3 rounded-control border border-paw-healthy bg-paw-healthy/10 px-3 py-2 text-xs font-semibold text-paw-healthy">
          已保存，{notice}
        </p>
      )}

      {expanded && (
        <div className="mt-4 space-y-3">
          {quickHealthRecordGroups.map((group) => (
            <div key={group.id}>
              <p className="mb-2 text-xs font-semibold text-paw-secondary">{group.label}</p>
              <div className="flex flex-wrap gap-2">
                {group.options.map((option) => (
                  <OptionButton
                    active={selection[group.id] === option.value}
                    key={option.value}
                    label={option.label}
                    onClick={() => setGroupValue(group.id, option.value)}
                  />
                ))}
              </div>
            </div>
          ))}

          <button
            className="w-full rounded-card bg-paw-primary px-4 py-3 text-sm font-semibold text-paw-background disabled:opacity-50"
            disabled={saving}
            onClick={handleSave}
            type="button"
          >
            {saving ? '正在保存...' : '保存今日记录'}
          </button>
        </div>
      )}
    </section>
  );
}

export default HomeQuickRecordCard;
