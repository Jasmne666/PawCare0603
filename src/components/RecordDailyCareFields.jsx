import { foodLevels } from '../data/recordCareOptions.js';

export function ChoiceGroup({ form, group, setField }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-paw-secondary">
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
  );
}

export function FoodAmountSection({ form, setField }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-paw-secondary">🍚 吃饭</p>
      <div className="mb-2 grid grid-cols-2 gap-2">
        {[
          ['relative', '按平常对比'],
          ['grams', '填写克数'],
        ].map(([value, label]) => (
          <button
            className={`rounded-control border px-3 py-2 text-xs font-semibold ${
              form.food_amount_mode === value
                ? 'border-paw-healthy bg-paw-healthy/10 text-paw-healthy'
                : 'border-paw-border bg-paw-background text-paw-muted'
            }`}
            key={value}
            onClick={() => setField('food_amount_mode', value)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      {form.food_amount_mode === 'grams' ? (
        <input
          className="w-full rounded-control border border-paw-border bg-paw-background px-3 py-3 text-sm outline-none focus:border-paw-healthy"
          inputMode="numeric"
          onChange={(event) => setField('food_amount_grams', event.target.value)}
          placeholder="今天大约吃了多少克"
          value={form.food_amount_grams}
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          {foodLevels.map(([value, label]) => (
            <button
              className={`rounded-full border px-3 py-2 text-xs font-semibold ${
                form.food_amount_level === value
                  ? 'border-paw-healthy bg-paw-healthy/10 text-paw-healthy'
                  : 'border-paw-border bg-paw-background text-paw-muted'
              }`}
              key={value}
              onClick={() => setField('food_amount_level', value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function WalkSection({ form, setField }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <input className="rounded-control border border-paw-border bg-paw-background px-3 py-3 text-sm outline-none focus:border-paw-healthy" inputMode="numeric" onChange={(event) => setField('walk_count', event.target.value)} placeholder="遛狗次数" value={form.walk_count} />
      <input className="rounded-control border border-paw-border bg-paw-background px-3 py-3 text-sm outline-none focus:border-paw-healthy" inputMode="numeric" onChange={(event) => setField('walk_minutes', event.target.value)} placeholder="总时长分钟" value={form.walk_minutes} />
    </div>
  );
}

export function TagSection({ selected, tags, toggleTag }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-paw-secondary">🐾 物种小观察</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button className={`rounded-full border px-3 py-2 text-xs font-semibold ${selected.includes(tag) ? 'border-paw-healthy bg-paw-healthy/10 text-paw-healthy' : 'border-paw-border bg-paw-background text-paw-muted'}`} key={tag} onClick={() => toggleTag(tag)} type="button">
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
