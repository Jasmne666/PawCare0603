import { useEffect, useState } from 'react';
import { recordEntrySections, sectionChoices, getSymptomOptions } from '../data/recordEntrySections.js';

function getInitial(record) {
  return {
    abnormal_notes: record?.abnormal_notes || '',
    activity: record?.activity || 'normal',
    custom_care_items: record?.custom_care_items || [],
    food_amount_grams: record?.food_amount_grams || '',
    food_amount_level: record?.food_amount_level || record?.appetite || 'normal',
    food_amount_mode: record?.food_amount_mode || 'relative',
    food_brand: record?.food_brand || '',
    food_serving_count: record?.food_serving_count || '',
    interaction: record?.interaction || 'none',
    mood: record?.mood || 'normal',
    species_care_tags: record?.species_care_tags || [],
    stool: record?.stool || 'normal',
    water: record?.water || 'normal',
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

function ToggleTagGrid({ options, selected, toggle }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map((option) => (
        <button
          className={`rounded-card border px-2 py-3 text-center text-xs font-semibold ${
            selected.includes(option)
              ? 'border-paw-healthy bg-paw-healthy/10 text-paw-healthy'
              : 'border-paw-border bg-paw-background text-paw-secondary'
          }`}
          key={option}
          onClick={() => toggle(option)}
          type="button"
        >
          <span className="mb-1 block text-xl">{option === '没有异常' ? '👍' : '🐾'}</span>
          {option}
        </button>
      ))}
    </div>
  );
}

function RecordEntryModal({ onClose, onSave, open, pet, record, saving, sectionId }) {
  const [customDraft, setCustomDraft] = useState('');
  const [form, setForm] = useState(() => getInitial(record));
  const section = recordEntrySections.find((item) => item.id === sectionId);

  useEffect(() => {
    if (open) setForm(getInitial(record));
  }, [open, record, sectionId]);

  if (!open || !section) return null;

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const toggleArray = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
  };
  const addCustom = () => {
    if (!customDraft.trim()) return;
    toggleArray('custom_care_items', customDraft.trim());
    setCustomDraft('');
  };
  const save = () => {
    onSave({
      ...form,
      appetite: form.food_amount_level === 'unknown' ? form.appetite || 'normal' : form.food_amount_level,
      food_amount_grams:
        form.food_amount_mode === 'grams' && form.food_amount_grams ? Number(form.food_amount_grams) : null,
      food_serving_count: form.food_serving_count ? Number(form.food_serving_count) : null,
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

        {sectionId === 'food' && <FoodEditor form={form} setField={setField} />}
        {sectionId === 'water' && <ChoiceButtons choices={sectionChoices.water} field="water" form={form} setField={setField} />}
        {sectionId === 'stool' && <ChoiceButtons choices={sectionChoices.stool} field="stool" form={form} setField={setField} />}
        {sectionId === 'mood' && <ChoiceButtons choices={sectionChoices.mood} field="mood" form={form} setField={setField} />}
        {sectionId === 'activity' && <ChoiceButtons choices={sectionChoices.activity} field="activity" form={form} setField={setField} />}
        {sectionId === 'interaction' && <ChoiceButtons choices={sectionChoices.interaction} field="interaction" form={form} setField={setField} />}
        {sectionId === 'symptoms' && (
          <ToggleTagGrid options={getSymptomOptions(pet)} selected={form.species_care_tags} toggle={(value) => toggleArray('species_care_tags', value)} />
        )}
        {sectionId === 'custom' && (
          <CustomEditor customDraft={customDraft} form={form} setCustomDraft={setCustomDraft} toggleArray={toggleArray} onAdd={addCustom} />
        )}

        <textarea
          className="mt-4 min-h-20 w-full resize-none rounded-control border border-paw-border bg-paw-background px-4 py-3 text-sm leading-6 outline-none focus:border-paw-healthy"
          onChange={(event) => setField('abnormal_notes', event.target.value)}
          placeholder={`补充${pet.name}今天的情况`}
          value={form.abnormal_notes}
        />
      </section>
    </div>
  );
}

function FoodEditor({ form, setField }) {
  return (
    <div className="space-y-3">
      <ChoiceButtons choices={sectionChoices.foodLevel} field="food_amount_level" form={form} setField={setField} />
      <div className="grid grid-cols-2 gap-2">
        <input className="rounded-control border border-paw-border bg-paw-background px-3 py-3 text-sm outline-none focus:border-paw-healthy" onChange={(event) => setField('food_brand', event.target.value)} placeholder="猫粮/狗粮品牌" value={form.food_brand} />
        <input className="rounded-control border border-paw-border bg-paw-background px-3 py-3 text-sm outline-none focus:border-paw-healthy" inputMode="decimal" onChange={(event) => setField('food_serving_count', event.target.value)} placeholder="几碗/几勺" value={form.food_serving_count} />
      </div>
      <input className="w-full rounded-control border border-paw-border bg-paw-background px-3 py-3 text-sm outline-none focus:border-paw-healthy" inputMode="numeric" onChange={(event) => { setField('food_amount_mode', 'grams'); setField('food_amount_grams', event.target.value); }} placeholder="知道克数的话，也可以填：例如 80" value={form.food_amount_grams} />
    </div>
  );
}

function CustomEditor({ customDraft, form, onAdd, setCustomDraft, toggleArray }) {
  return (
    <div className="space-y-3">
      <ToggleTagGrid options={form.custom_care_items} selected={form.custom_care_items} toggle={(value) => toggleArray('custom_care_items', value)} />
      <div className="flex gap-2">
        <input className="min-w-0 flex-1 rounded-control border border-paw-border bg-paw-background px-3 py-3 text-sm outline-none focus:border-paw-healthy" onChange={(event) => setCustomDraft(event.target.value)} placeholder="自己添加一个记录项" value={customDraft} />
        <button className="rounded-control bg-paw-primary px-4 py-3 text-sm font-semibold text-paw-background" onClick={onAdd} type="button">
          添加
        </button>
      </div>
    </div>
  );
}

export default RecordEntryModal;
