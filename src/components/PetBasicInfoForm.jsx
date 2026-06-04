import { getSpeciesLabel } from '../data/petOptions.js';
import PetAvatarSection from './PetAvatarSection.jsx';
import PetSpeciesBreedFields from './PetSpeciesBreedFields.jsx';
import ProfileField from './ProfileField.jsx';

const genderOptions = ['未知', '男孩', '女孩'];

function PetBasicInfoForm({ form, inputClass, setValue }) {
  const avatarSrc = form.avatar_preview_url || form.avatar_url;
  const speciesLabel =
    form.species === 'other' ? form.custom_species : getSpeciesLabel(form.species);
  const breedLabel = form.breed === '其他' ? form.custom_breed : form.breed;

  return (
    <>
      <section className="rounded-card border border-paw-border bg-paw-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-card border border-paw-border bg-paw-background text-4xl">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={form.name || '宠物头像'}
                className="h-full w-full object-cover"
              />
            ) : (
              form.avatar
            )}
          </div>
          <div>
            <h2 className="font-title text-xl font-semibold">
              {form.name || '还没有名字'}
            </h2>
            <p className="mt-1 text-xs text-paw-muted">
              {speciesLabel || '未选择物种'} · {breedLabel || '未填写品种'}
            </p>
          </div>
        </div>
      </section>

      <PetAvatarSection form={form} setValue={setValue} />

      <section className="space-y-3 rounded-card border border-paw-border bg-paw-card p-4">
        <h2 className="font-title text-lg font-semibold">基本信息</h2>

        <ProfileField label="名字">
          <input
            value={form.name}
            onChange={(event) => setValue('name', event.target.value)}
            placeholder="例如：豆豆"
            className={inputClass}
          />
        </ProfileField>

        <PetSpeciesBreedFields form={form} inputClass={inputClass} setValue={setValue} />

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
