import { useEffect, useState } from 'react';
import {
  healthLogEntrySections,
  healthLogMoodChoices,
  healthLogPoopChoices,
  healthLogSymptomChoices,
} from '../data/healthLogEntrySections.js';

function getInitial(log) {
  return {
    activity_minutes: log?.activity_minutes || '',
    food_amount: log?.food_amount || '',
    interaction_minutes: log?.interaction_minutes || '',
    mood: log?.mood || '😊',
    notes: log?.notes || '',
    poop_count: log?.poop_count ?? '1',
    poop_status: log?.poop_status || '正常',
    symptoms: log?.symptoms || [],
    water_amount: log?.water_amount || '',
  };
}

function ChoiceButtons({ choices, field, form, setField }) {
  return (
    <div className="flex flex-wrap gap-2">
      {choices.map(([value, label]) => (
        <button
          className={`rounded-full border px-3 py-2 text-xs font-semibold ${
            form[field] === value
              ? 'border-paw-healthy bg-paw-healthy/10 text-paw-healthy'
              : 'border-paw-border bg-paw-background text-paw-muted'
          }`}
          key={value}
          onClick={() => setField(field, value)}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function SymptomGrid({ form, toggleSymptom }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {healthLogSymptomChoices.map((symptom) => (
        <button
          className={`rounded-control border px-2 py-2 text-xs font-semibold ${
            form.symptoms.includes(symptom)
              ? 'border-paw-danger bg-paw-danger/10 text-paw-danger'
              : 'border-paw-border bg-paw-background text-paw-muted'
          }`}
          key={symptom}
          onClick={() => toggleSymptom(symptom)}
          type="button"
        >
          {symptom}
        </button>
      ))}
    </div>
  );
}

function HealthLogEntryModal({ log, onClose, onSave, open, saving, sectionId }) {
  const [form, setForm] = useState(() => getInitial(log));
  const section = healthLogEntrySections.find((item) => item.id === sectionId);

  useEffect(() => {
    if (open) setForm(getInitial(log));
  }, [log, open, sectionId]);

  if (!open || !section) return null;

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const toggleSymptom = (symptom) => {
    setForm((current) => ({
      ...current,
      symptoms: current.symptoms.includes(symptom)
        ? current.symptoms.filter((item) => item !== symptom)
        : [...current.symptoms, symptom],
    }));
  };

  const save = () => {
    onSave({
      activity_minutes: form.activity_minutes ? Number(form.activity_minutes) : null,
      food_amount: form.food_amount ? Number(form.food_amount) : null,
      interaction_minutes: form.interaction_minutes ? Number(form.interaction_minutes) : null,
      mood: form.mood,
      notes: form.notes.trim() || null,
      poop_count: form.poop_count === '' ? null : Number(form.poop_count),
      poop_status: form.poop_status,
      symptoms: form.symptoms,
      water_amount: form.water_amount ? Number(form.water_amount) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-paw-primary/45 px-3 pb-3">
      <section className="mx-auto max-h-[86vh] w-full max-w-app overflow-y-auto rounded-t-[26px] bg-paw-card p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <button className="text-sm font-semibold text-paw-muted" onClick={onClose} type="button">
            取消
          </button>
          <h2 className="font-title text-2xl font-semibold">
            {section.icon} {section.label}
          </h2>
          <button className="text-sm font-semibold text-paw-healthy" disabled={saving} onClick={save} type="button">
            确定
          </button>
        </div>

        {sectionId === 'food' && <NumberInput label="进食量" setField={setField} unit="g" value={form.food_amount} field="food_amount" />}
        {sectionId === 'water' && <NumberInput label="饮水量" setField={setField} unit="ml" value={form.water_amount} field="water_amount" />}
        {sectionId === 'poop' && (
          <div className="space-y-3">
            <NumberInput label="排便次数" setField={setField} unit="次" value={form.poop_count} field="poop_count" />
            <select className="w-full rounded-control border border-paw-border bg-paw-background px-3 py-3 text-sm outline-none focus:border-paw-healthy" onChange={(event) => setField('poop_status', event.target.value)} value={form.poop_status}>
              {healthLogPoopChoices.map((choice) => <option key={choice} value={choice}>{choice}</option>)}
            </select>
          </div>
        )}
        {sectionId === 'mood' && <ChoiceButtons choices={healthLogMoodChoices} field="mood" form={form} setField={setField} />}
        {sectionId === 'activity' && <NumberInput label="散步/活动时长" setField={setField} unit="分钟" value={form.activity_minutes} field="activity_minutes" />}
        {sectionId === 'interaction' && <NumberInput label="互动/陪玩时长" setField={setField} unit="分钟" value={form.interaction_minutes} field="interaction_minutes" />}
        {sectionId === 'symptoms' && <SymptomGrid form={form} toggleSymptom={toggleSymptom} />}

        <textarea
          className="mt-4 min-h-20 w-full resize-none rounded-control border border-paw-border bg-paw-background px-4 py-3 text-sm leading-6 outline-none focus:border-paw-healthy"
          onChange={(event) => setField('notes', event.target.value)}
          placeholder="补充今天的特殊情况"
          value={form.notes}
        />
      </section>
    </div>
  );
}

function NumberInput({ field, label, setField, unit, value }) {
  return (
    <label className="block text-sm font-semibold text-paw-secondary">
      {label}
      <div className="mt-2 flex items-center gap-2">
        <input
          className="min-w-0 flex-1 rounded-control border border-paw-border bg-paw-background px-3 py-3 text-sm outline-none focus:border-paw-healthy"
          inputMode="numeric"
          min="0"
          onChange={(event) => setField(field, event.target.value)}
          placeholder={`输入${label}`}
          type="number"
          value={value}
        />
        <span className="text-xs text-paw-muted">{unit}</span>
      </div>
    </label>
  );
}

export default HealthLogEntryModal;
