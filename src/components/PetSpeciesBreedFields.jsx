import { getBreedOptions, petSpeciesOptions } from '../data/petOptions.js';
import ProfileField from './ProfileField.jsx';

function PetSpeciesBreedFields({ form, inputClass, setValue }) {
  const breedOptions = getBreedOptions(form.species);
  const hasSpecies = Boolean(form.species);

  const handleSpeciesChange = (value) => {
    setValue('species', value);
    setValue('custom_species', '');
    setValue('breed', '');
    setValue('custom_breed', '');
  };

  const handleBreedChange = (event) => {
    setValue('breed', event.target.value);
    setValue('custom_breed', '');
  };

  return (
    <>
      <ProfileField label="物种">
        <div className="grid grid-cols-2 gap-2">
          {petSpeciesOptions.map((option) => (
            <button
              className={`rounded-control border px-3 py-2 text-sm font-medium transition ${
                form.species === option.value
                  ? 'border-paw-healthy bg-paw-healthy/10 text-paw-healthy'
                  : 'border-paw-border bg-paw-background text-paw-muted'
              }`}
              key={option.value}
              onClick={() => handleSpeciesChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </ProfileField>

      {form.species === 'other' && (
        <ProfileField label="具体物种">
          <input
            className={inputClass}
            onChange={(event) => setValue('custom_species', event.target.value)}
            placeholder="例如：刺猬、蜜袋鼯"
            type="text"
            value={form.custom_species}
          />
        </ProfileField>
      )}

      <ProfileField label="品种">
        <select
          className={inputClass}
          disabled={!hasSpecies}
          onChange={handleBreedChange}
          value={form.breed}
        >
          <option value="">{hasSpecies ? '请选择品种' : '请先选择宠物物种'}</option>
          {breedOptions.map((breed) => (
            <option key={breed} value={breed}>
              {breed}
            </option>
          ))}
        </select>
      </ProfileField>

      {form.breed === '其他' && (
        <ProfileField label="具体品种">
          <input
            className={inputClass}
            onChange={(event) => setValue('custom_breed', event.target.value)}
            placeholder="请输入具体品种"
            type="text"
            value={form.custom_breed}
          />
        </ProfileField>
      )}
    </>
  );
}

export default PetSpeciesBreedFields;
