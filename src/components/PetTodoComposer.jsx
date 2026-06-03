import { useEffect, useMemo, useState } from 'react';
import {
  getPetTodoCategoryLabel,
  getPetTodoTemplate,
  petTodoTemplates,
} from '../data/petTodoOptions.js';
import { addDays, getLocalDateString } from '../utils/todoDates.js';

function getInitialForm(type = 'external_deworming') {
  const template = getPetTodoTemplate(type);
  const today = getLocalDateString();
  return {
    due_date: template.repeatDays ? addDays(today, template.repeatDays) : today,
    note: '',
    repeat_days: template.repeatDays ?? '',
    title: template.title,
    type: template.type,
  };
}

function PetTodoComposer({ onClose, onSubmit, open, saving }) {
  const [form, setForm] = useState(() => getInitialForm());
  const [localError, setLocalError] = useState('');
  const selectedTemplate = useMemo(() => getPetTodoTemplate(form.type), [form.type]);

  useEffect(() => {
    if (open) {
      setForm(getInitialForm());
      setLocalError('');
    }
  }, [open]);

  if (!open) return null;

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleTypeChange = (type) => {
    setForm(getInitialForm(type));
  };

  const handleSubmit = async () => {
    setLocalError('');
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setLocalError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-paw-primary/40 px-4 pb-4">
      <section className="mx-auto max-h-[88vh] w-full max-w-app overflow-y-auto rounded-card bg-paw-card p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-paw-muted">近期待办</p>
            <h2 className="font-title text-2xl font-semibold">添加照护事项</h2>
          </div>
          <button className="text-sm font-semibold text-paw-muted" onClick={onClose} type="button">
            关闭
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {petTodoTemplates.map((template) => (
            <button
              className={`rounded-control border px-3 py-3 text-left text-sm font-semibold ${
                form.type === template.type
                  ? 'border-paw-healthy bg-paw-healthy/10 text-paw-healthy'
                  : 'border-paw-border bg-paw-background text-paw-secondary'
              }`}
              key={template.type}
              onClick={() => handleTypeChange(template.type)}
              type="button"
            >
              <span className="mr-2">{template.icon}</span>
              {template.title}
              <span className="mt-1 block text-[10px] font-medium text-paw-muted">
                {getPetTodoCategoryLabel(template.category)}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          <label className="block text-sm font-semibold text-paw-secondary">
            标题
            <input
              className="mt-2 w-full rounded-control border border-paw-border bg-paw-background px-4 py-3 text-sm outline-none focus:border-paw-healthy"
              onChange={(event) => setField('title', event.target.value)}
              value={form.title}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-semibold text-paw-secondary">
              到期日期
              <input
                className="mt-2 w-full rounded-control border border-paw-border bg-paw-background px-3 py-3 text-sm outline-none focus:border-paw-healthy"
                onChange={(event) => setField('due_date', event.target.value)}
                type="date"
                value={form.due_date}
              />
            </label>
            <label className="block text-sm font-semibold text-paw-secondary">
              周期天数
              <input
                className="mt-2 w-full rounded-control border border-paw-border bg-paw-background px-3 py-3 text-sm outline-none focus:border-paw-healthy"
                min="1"
                onChange={(event) => setField('repeat_days', event.target.value)}
                placeholder="不重复"
                type="number"
                value={form.repeat_days}
              />
            </label>
          </div>

          <label className="block text-sm font-semibold text-paw-secondary">
            备注
            <textarea
              className="mt-2 min-h-20 w-full resize-none rounded-control border border-paw-border bg-paw-background px-4 py-3 text-sm leading-6 outline-none focus:border-paw-healthy"
              onChange={(event) => setField('note', event.target.value)}
              placeholder={`${selectedTemplate.title}需要注意的事`}
              value={form.note}
            />
          </label>
        </div>

        {localError && (
          <p className="mt-3 rounded-control border border-paw-danger bg-paw-danger/10 px-4 py-3 text-sm text-paw-danger">
            {localError}
          </p>
        )}

        <button
          className="mt-4 w-full rounded-card bg-paw-primary px-5 py-4 text-sm font-semibold text-paw-background disabled:opacity-60"
          disabled={saving}
          onClick={handleSubmit}
          type="button"
        >
          {saving ? '正在保存...' : '保存待办'}
        </button>
      </section>
    </div>
  );
}

export default PetTodoComposer;
