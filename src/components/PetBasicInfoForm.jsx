import PetAvatarPicker from './PetAvatarPicker.jsx';
import ProfileField from './ProfileField.jsx';

const speciesOptions = ['猫', '狗', '兔子', '仓鼠', '其他'];
const genderOptions = ['未知', '男孩', '女孩'];

function PetBasicInfoForm({ form, inputClass, setValue }) {
  return (
    <>
      <section className="rounded-card border border-paw-border bg-paw-card p-5">
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-card border border-paw-border bg-paw-background text-5xl">
            {form.avatar_url ? (
              <img
                src={form.avatar_url}
                alt={form.name || '宠物头像'}
                className="h-full w-full object-cover"
              />
            ) : (
              form.avatar
            )}
          </div>
          <div>
            <h2 className="font-title text-2xl font-semibold">
              {form.name || '还没有名字'}
            </h2>
            <p className="mt-1 text-sm text-paw-muted">
              {form.species} · {form.breed || '未填写品种'}
            </p>
          </div>
        </div>

        <ProfileField label="头像表情">
          <PetAvatarPicker value={form.avatar} onChange={(value) => setValue('avatar', value)} />
        </ProfileField>
      </section>

      <section className="space-y-4 rounded-card border border-paw-border bg-paw-card p-5">
        <h2 className="font-title text-xl font-semibold">基本信息</h2>

        <ProfileField label="名字">
          <input
            value={form.name}
            onChange={(event) => setValue('name', event.target.value)}
            placeholder="例如：豆豆"
            className={inputClass}
          />
        </ProfileField>

        <ProfileField label="物种">
          <div className="grid grid-cols-5 gap-2">
            {speciesOptions.map((species) => (
              <button
                key={species}
                type="button"
                onClick={() => setValue('species', species)}
                className={`rounded-control border px-2 py-2 text-sm font-semibold transition ${
                  form.species === species
                    ? 'border-paw-healthy bg-[#EEF6F1] text-paw-healthy'
                    : 'border-paw-border bg-paw-background text-paw-muted'
                }`}
              >
                {species}
              </button>
            ))}
          </div>
        </ProfileField>

        <div className="grid grid-cols-2 gap-3">
          <ProfileField label="品种">
            <input
              value={form.breed}
              onChange={(event) => setValue('breed', event.target.value)}
              placeholder="英国短毛猫"
              className={inputClass}
            />
          </ProfileField>
          <ProfileField label="性别">
            <select
              value={form.gender}
              onChange={(event) => setValue('gender', event.target.value)}
              className={inputClass}
            >
              {genderOptions.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </ProfileField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ProfileField label="生日">
            <input
              type="date"
              value={form.birth_date}
              onChange={(event) => setValue('birth_date', event.target.value)}
              className={inputClass}
            />
          </ProfileField>
          <ProfileField label="体重" hint="kg">
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.weight_kg}
              onChange={(event) => setValue('weight_kg', event.target.value)}
              placeholder="4.20"
              className={inputClass}
            />
          </ProfileField>
        </div>

        <ProfileField label="毛色">
          <input
            value={form.color}
            onChange={(event) => setValue('color', event.target.value)}
            placeholder="蓝白色"
            className={inputClass}
          />
        </ProfileField>
      </section>
    </>
  );
}

export default PetBasicInfoForm;

