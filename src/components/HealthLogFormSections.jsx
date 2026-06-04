import {
  moodOptions,
  poopStatusOptions,
  symptomOptions,
} from '../data/healthLogOptions.js';
import LogChoiceGroup from './LogChoiceGroup.jsx';
import ProfileField from './ProfileField.jsx';
import SymptomSelector from './SymptomSelector.jsx';

const metricFields = [
  { key: 'food_amount', label: '进食量', hint: 'g', placeholder: '例如：150' },
  { key: 'water_amount', label: '饮水量', hint: 'ml', placeholder: '例如：220' },
  { key: 'weight_kg', label: '今日体重', hint: 'kg，可选', placeholder: '例如：4.20', step: '0.01' },
];

export function PetSummary({ pet }) {
  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-card border border-paw-border bg-paw-background text-4xl">
          {pet.avatar_url ? (
            <img className="h-full w-full object-cover" src={pet.avatar_url} alt={pet.name} />
          ) : (
            pet.avatar || '🐾'
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-paw-muted">正在记录</p>
          <h2 className="mt-1 font-title text-2xl font-semibold">{pet.name}</h2>
          <p className="mt-1 text-xs text-paw-muted">
            {pet.species} · {pet.breed || '未填写品种'}
          </p>
        </div>
      </div>
    </section>
  );
}

export function HealthMetricSection({ form, inputClass, setField }) {
  return (
    <section className="space-y-4 rounded-card border border-paw-border bg-paw-card p-5">
      <h2 className="font-title text-xl font-semibold">基础数据</h2>
      <ProfileField label="记录日期">
        <input
          className={inputClass}
          onChange={(event) => setField('log_date', event.target.value)}
          type="date"
          value={form.log_date}
        />
      </ProfileField>

      <div className="grid grid-cols-2 gap-3">
        {metricFields.map((field) => (
          <ProfileField hint={field.hint} key={field.key} label={field.label}>
            <input
              className={inputClass}
              min="0"
              onChange={(event) => setField(field.key, event.target.value)}
              placeholder={field.placeholder}
              step={field.step || '1'}
              type="number"
              value={form[field.key]}
            />
          </ProfileField>
        ))}
      </div>
    </section>
  );
}

export function HealthStatusSection({ form, inputClass, setField }) {
  return (
    <section className="space-y-4 rounded-card border border-paw-border bg-paw-card p-5">
      <h2 className="font-title text-xl font-semibold">排便与状态</h2>
      <div className="grid grid-cols-2 gap-3">
        <ProfileField hint="次" label="排便次数">
          <input
            className={inputClass}
            min="0"
            onChange={(event) => setField('poop_count', event.target.value)}
            type="number"
            value={form.poop_count}
          />
        </ProfileField>
        <ProfileField label="排便状态">
          <select
            className={inputClass}
            onChange={(event) => setField('poop_status', event.target.value)}
            value={form.poop_status}
          >
            {poopStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </ProfileField>
      </div>

      <ProfileField label="心情">
        <LogChoiceGroup
          getLabel={(option) => option.icon}
          onChange={(value) => setField('mood', value)}
          options={moodOptions}
          value={form.mood}
        />
      </ProfileField>

      <div className="grid grid-cols-2 gap-3">
        <ProfileField hint="分钟" label="活动时长">
          <input
            className={inputClass}
            min="0"
            onChange={(event) => setField('activity_minutes', event.target.value)}
            placeholder="例如：30"
            type="number"
            value={form.activity_minutes}
          />
        </ProfileField>
        <ProfileField hint="分钟" label="互动时长">
          <input
            className={inputClass}
            min="0"
            onChange={(event) => setField('interaction_minutes', event.target.value)}
            placeholder="例如：20"
            type="number"
            value={form.interaction_minutes}
          />
        </ProfileField>
      </div>
    </section>
  );
}

export function HealthNotesSection({ form, inputClass, petName, setField }) {
  return (
    <section className="space-y-4 rounded-card border border-paw-border bg-paw-card p-5">
      <h2 className="font-title text-xl font-semibold">异常与备注</h2>
      <ProfileField label="异常症状">
        <SymptomSelector
          onChange={(value) => setField('symptoms', value)}
          options={symptomOptions}
          value={form.symptoms}
        />
      </ProfileField>
      <ProfileField label="今日备注">
        <textarea
          className={`${inputClass} min-h-28 resize-none leading-6`}
          onChange={(event) => setField('notes', event.target.value)}
          placeholder={`记录${petName}今天的特殊情况`}
          value={form.notes}
        />
      </ProfileField>
    </section>
  );
}
