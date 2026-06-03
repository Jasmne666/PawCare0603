import { useEffect, useState } from 'react';
import { dailyCareDetailGroups, dailyCareSummaryFields, getDailyCareLabel } from '../data/dailyCareOptions.js';

const defaultForm = {
  abnormal_notes: '',
  activity: 'normal',
  appetite: 'normal',
  interaction: 'none',
  mood: 'normal',
  stool: 'normal',
  water: 'normal',
};

function toCareForm(record) {
  if (!record) return defaultForm;
  return {
    abnormal_notes: record.abnormal_notes || '',
    activity: record.activity || 'normal',
    appetite: record.appetite || 'normal',
    interaction: record.interaction || 'none',
    mood: record.mood || 'normal',
    stool: record.stool || 'normal',
    water: record.water || 'normal',
  };
}

function PetAvatar({ pet }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-card border border-paw-border bg-paw-background text-3xl">
      {pet.avatar_url ? (
        <img className="h-full w-full object-cover" src={pet.avatar_url} alt={pet.name} />
      ) : (
        pet.avatar || '🐾'
      )}
    </div>
  );
}

function StatusSummary({ record }) {
  if (!record) {
    return (
      <p className="mt-3 rounded-control bg-paw-background px-4 py-3 text-sm leading-6 text-paw-muted">
        今天还没有照护小报告。点一下快捷按钮就能记录。
      </p>
    );
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {dailyCareSummaryFields.map((field) => (
        <div className="rounded-control bg-paw-background px-3 py-2" key={field.key}>
          <p className="text-[11px] text-paw-muted">
            {field.icon} {field.label}
          </p>
          <p className="mt-1 truncate text-xs font-semibold text-paw-secondary">
            {getDailyCareLabel(field.key, record[field.key])}
          </p>
        </div>
      ))}
    </div>
  );
}

function DailyCareCard({
  error,
  feedback,
  loading,
  onSaveRecord,
  pet,
  record,
  saving,
}) {
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    setForm(toCareForm(record));
  }, [record]);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveNormal = () => {
    onSaveRecord(
      {
        abnormal_notes: null,
        activity: 'normal',
        appetite: 'normal',
        interaction: 'none',
        mood: 'happy',
        stool: 'normal',
        water: 'normal',
      },
      `${pet.name}的小报告已记录，今天也是被好好照顾的一天 🐾`,
    );
  };

  const saveDetailed = () => {
    onSaveRecord(form, `${pet.name}的小报告已保存，照护记录又完整了一点 ✨`);
  };

  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <PetAvatar pet={pet} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-paw-muted">今日照护</p>
            <h2 className="mt-1 truncate font-title text-2xl font-semibold">{pet.name}的小报告</h2>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-paw-healthy/10 px-3 py-1 text-xs font-semibold text-paw-healthy">
          {record ? '已记录' : '待记录'}
        </span>
      </div>

      <StatusSummary record={record} />

      {feedback && (
        <p className="mt-3 rounded-control border border-paw-healthy bg-paw-healthy/10 px-4 py-3 text-sm leading-6 text-paw-healthy">
          {feedback}
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-control border border-paw-danger bg-paw-danger/10 px-4 py-3 text-sm leading-6 text-paw-danger">
          {error}
        </p>
      )}

      <div className="mt-4 space-y-2">
        <button
          className="w-full rounded-card bg-paw-primary px-4 py-4 text-sm font-semibold text-paw-background transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading || saving}
          onClick={saveNormal}
          type="button"
        >
          一键记录：今天正常
        </button>
        <button
          className="w-full rounded-control border border-paw-border bg-paw-background px-4 py-3 text-sm font-semibold text-paw-secondary"
          onClick={() => setExpanded((current) => !current)}
          type="button"
        >
          {expanded ? '收起详细记录' : '展开详细记录'}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          {dailyCareDetailGroups.map((group) => (
            <div key={group.key}>
              <p className="mb-2 text-sm font-semibold text-paw-secondary">
                {group.icon} {group.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.options.map(([value, label]) => (
                  <button
                    className={`rounded-full border px-3 py-2 text-xs font-semibold ${
                      form[group.key] === value
                        ? 'border-paw-healthy bg-paw-healthy/10 text-paw-healthy'
                        : 'border-paw-border bg-paw-background text-paw-muted'
                    }`}
                    key={value}
                    onClick={() => setField(group.key, value)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <label className="block text-sm font-semibold text-paw-secondary">
            异常备注
            <textarea
              className="mt-2 min-h-20 w-full resize-none rounded-control border border-paw-border bg-paw-background px-4 py-3 text-sm leading-6 outline-none focus:border-paw-healthy"
              onChange={(event) => setField('abnormal_notes', event.target.value)}
              placeholder={`记录${pet.name}今天比较特别的情况`}
              value={form.abnormal_notes}
            />
          </label>
          <button
            className="w-full rounded-card bg-paw-primary px-4 py-4 text-sm font-semibold text-paw-background disabled:opacity-50"
            disabled={loading || saving}
            onClick={saveDetailed}
            type="button"
          >
            {saving ? '正在保存...' : '保存今日小报告'}
          </button>
        </div>
      )}
    </section>
  );
}

export default DailyCareCard;
