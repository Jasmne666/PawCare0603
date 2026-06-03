import { useEffect, useMemo, useState } from 'react';
import { dailyCareDetailGroups } from '../data/dailyCareOptions.js';
import { getSpeciesCareTags, getSpeciesKey } from '../data/recordCareOptions.js';
import {
  ChoiceGroup,
  FoodAmountSection,
  TagSection,
  WalkSection,
} from './RecordDailyCareFields.jsx';

const defaultForm = {
  abnormal_notes: '',
  activity: 'normal',
  appetite: 'normal',
  food_amount_grams: '',
  food_amount_level: 'normal',
  food_amount_mode: 'relative',
  interaction: 'none',
  mood: 'normal',
  species_care_tags: [],
  stool: 'normal',
  walk_count: '',
  walk_minutes: '',
  water: 'normal',
};

function toForm(record) {
  return {
    ...defaultForm,
    ...record,
    abnormal_notes: record?.abnormal_notes || '',
    food_amount_grams: record?.food_amount_grams || '',
    food_amount_level: record?.food_amount_level || record?.appetite || 'normal',
    food_amount_mode: record?.food_amount_mode || 'relative',
    species_care_tags: record?.species_care_tags || [],
    walk_count: record?.walk_count || '',
    walk_minutes: record?.walk_minutes || '',
  };
}

function toPayload(form) {
  return {
    ...form,
    appetite: form.food_amount_level === 'unknown' ? form.appetite : form.food_amount_level,
    food_amount_grams:
      form.food_amount_mode === 'grams' && form.food_amount_grams ? Number(form.food_amount_grams) : null,
    species_care_tags: form.species_care_tags,
    walk_count: form.walk_count ? Number(form.walk_count) : null,
    walk_minutes: form.walk_minutes ? Number(form.walk_minutes) : null,
  };
}

function RecordDailyCarePanel({ error, loading, onSave, pet, record, saving }) {
  const [form, setForm] = useState(defaultForm);
  const [localError, setLocalError] = useState('');
  const speciesTags = useMemo(() => getSpeciesCareTags(pet.species), [pet.species]);

  useEffect(() => {
    setForm(toForm(record));
  }, [record]);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const toggleTag = (tag) => {
    setForm((current) => ({
      ...current,
      species_care_tags: current.species_care_tags.includes(tag)
        ? current.species_care_tags.filter((item) => item !== tag)
        : [...current.species_care_tags, tag],
    }));
  };

  const handleSave = async () => {
    setLocalError('');
    try {
      await onSave(toPayload(form));
    } catch (err) {
      setLocalError(err.message);
    }
  };

  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-paw-muted">今日详细记录</p>
          <h2 className="mt-1 font-title text-2xl font-semibold">{pet.name}今天怎么样</h2>
        </div>
        <span className="rounded-full bg-paw-healthy/10 px-3 py-1 text-[11px] font-semibold text-paw-healthy">
          {record ? '已记录' : '待记录'}
        </span>
      </div>

      {(error || localError) && (
        <p className="mb-4 rounded-control border border-paw-danger bg-paw-danger/10 px-3 py-2 text-xs text-paw-danger">
          {localError || error}
        </p>
      )}

      <div className="space-y-4">
        <FoodAmountSection form={form} setField={setField} />
        {dailyCareDetailGroups.slice(1).map((group) => (
          <ChoiceGroup form={form} group={group} key={group.key} setField={setField} />
        ))}
        {getSpeciesKey(pet.species) === 'dog' && <WalkSection form={form} setField={setField} />}
        <TagSection selected={form.species_care_tags} tags={speciesTags} toggleTag={toggleTag} />
        <textarea
          className="min-h-20 w-full resize-none rounded-control border border-paw-border bg-paw-background px-3 py-3 text-sm leading-6 outline-none focus:border-paw-healthy"
          onChange={(event) => setField('abnormal_notes', event.target.value)}
          placeholder="补充今天比较特别的情况，例如跑酷、躲起来、吐毛、外出状态..."
          value={form.abnormal_notes}
        />
        <button
          className="w-full rounded-card bg-paw-primary px-4 py-4 text-sm font-semibold text-paw-background disabled:opacity-60"
          disabled={loading || saving}
          onClick={handleSave}
          type="button"
        >
          {saving ? '正在保存...' : '保存今日记录'}
        </button>
      </div>
    </section>
  );
}

export default RecordDailyCarePanel;
