import ProfileField from './ProfileField.jsx';

const healthOptions = [
  ['neutered', '已绝育'],
  ['vaccinated', '已接种疫苗'],
  ['is_public', '公开到社区'],
];

function PetHealthForm({ form, inputClass, setValue }) {
  return (
    <section className="space-y-4 rounded-card border border-paw-border bg-paw-card p-5">
      <h2 className="font-title text-xl font-semibold">健康状态</h2>
      <div className="grid grid-cols-2 gap-3">
        {healthOptions.map(([key, label]) => (
          <label
            key={key}
            className="flex items-center justify-between rounded-control border border-paw-border bg-paw-background px-4 py-3 text-sm font-semibold text-paw-secondary"
          >
            {label}
            <input
              type="checkbox"
              checked={form[key]}
              onChange={(event) => setValue(key, event.target.checked)}
              className="h-4 w-4 accent-paw-healthy"
            />
          </label>
        ))}
      </div>

      <ProfileField label="头像图片链接" hint="可选">
        <input
          value={form.avatar_url}
          onChange={(event) => setValue('avatar_url', event.target.value)}
          placeholder="https://..."
          className={inputClass}
        />
      </ProfileField>

      <ProfileField label="已知疾病 / 医疗备注">
        <textarea
          value={form.medical_notes}
          onChange={(event) => setValue('medical_notes', event.target.value)}
          rows={3}
          placeholder="例如：无，或填写过敏、慢性病、用药情况"
          className={`${inputClass} resize-none leading-7`}
        />
      </ProfileField>
    </section>
  );
}

export default PetHealthForm;

