import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DeepSeekKeyPanel from '../components/DeepSeekKeyPanel.jsx';
import {
  HealthMetricSection,
  HealthNotesSection,
  HealthStatusSection,
  PetSummary,
} from '../components/HealthLogFormSections.jsx';
import PetSwitcher from '../components/PetSwitcher.jsx';
import { emptyHealthLogForm, useHealthLogs } from '../hooks/useHealthLogs.js';
import { usePets } from '../hooks/usePets.js';

const inputClass =
  'w-full rounded-control border border-paw-border bg-paw-background px-4 py-3 text-sm text-paw-primary outline-none transition focus:border-paw-healthy';

function Log() {
  const [searchParams] = useSearchParams();
  const initialDate = searchParams.get('date') || emptyHealthLogForm.log_date;
  const { activePetId, loading, pet, pets, selectPet } = usePets();
  const { error, saveHealthLog, saving } = useHealthLogs();
  const [form, setForm] = useState({ ...emptyHealthLogForm, log_date: initialDate });
  const [feedback, setFeedback] = useState('');
  const [formError, setFormError] = useState('');

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback('');
    setFormError('');

    try {
      const savedLog = await saveHealthLog(form, pet);
      setFeedback(savedLog.ai_feedback || '记录已保存');
      setForm({ ...emptyHealthLogForm, log_date: form.log_date });
    } catch (err) {
      setFormError(err.message);
    }
  };

  if (loading) {
    return (
      <section className="rounded-card border border-paw-border bg-paw-card p-5">
        <p className="text-sm font-medium text-paw-muted">每日记录</p>
        <h1 className="mt-2 font-title text-3xl font-semibold">正在读取宠物档案</h1>
      </section>
    );
  }

  if (!pet) {
    return (
      <section className="rounded-card border border-paw-border bg-paw-card p-5">
        <p className="text-sm font-medium text-paw-muted">每日记录</p>
        <h1 className="mt-2 font-title text-3xl font-semibold">请先创建宠物档案</h1>
        <p className="mt-3 text-sm leading-6 text-paw-muted">
          每日记录需要关联到一只宠物。先去档案页填写宠物基本信息，然后再回来记录健康数据。
        </p>
        <Link
          className="mt-5 inline-flex rounded-control bg-paw-primary px-4 py-3 text-sm font-semibold text-paw-background"
          to="/profile"
        >
          去创建档案
        </Link>
      </section>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <section>
        <p className="text-sm font-medium text-paw-muted">每日记录</p>
        <h1 className="mt-2 font-title text-3xl font-semibold">记录宠物状态</h1>
      </section>

      <PetSwitcher activePetId={activePetId} label="正在记录" onSelectPet={selectPet} pets={pets} />
      <PetSummary pet={pet} />

      {(feedback || formError || error) && (
        <section
          className={`rounded-card border p-4 text-sm leading-6 ${
            formError || error
              ? 'border-paw-danger bg-paw-danger/10 text-paw-danger'
              : 'border-paw-healthy bg-paw-healthy/10 text-paw-healthy'
          }`}
        >
          {formError || error || feedback}
        </section>
      )}

      <HealthMetricSection form={form} inputClass={inputClass} setField={setField} />
      <HealthStatusSection form={form} inputClass={inputClass} setField={setField} />
      <HealthNotesSection
        form={form}
        inputClass={inputClass}
        petName={pet.name}
        setField={setField}
      />

      <DeepSeekKeyPanel />

      <button
        className="w-full rounded-card bg-paw-primary px-5 py-4 text-base font-semibold text-paw-background shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
        disabled={saving}
        type="submit"
      >
        {saving ? '正在保存...' : '保存记录并生成反馈'}
      </button>
    </form>
  );
}

export default Log;
