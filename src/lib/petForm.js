import { getBreedOptions, getSpeciesLabel, normalizeSpeciesValue } from '../data/petOptions.js';
import { normalizePetAvatarUrl } from './petAvatarStorage.js';

export const emptyPetForm = {
  id: '',
  name: '',
  species: '',
  custom_species: '',
  breed: '',
  custom_breed: '',
  gender: '未知',
  birth_date: '',
  color: '',
  weight_kg: '',
  medical_notes: '无',
  avatar_url: '',
  avatar_file: null,
  avatar_preview_url: '',
  avatar: '🐾',
  neutered: false,
  vaccinated: false,
  is_public: false,
};

export function toPetForm(pet) {
  if (!pet) return emptyPetForm;

  const speciesValue = normalizeSpeciesValue(pet.species);
  const breedOptions = getBreedOptions(speciesValue);
  const breedValue = pet.breed && breedOptions.includes(pet.breed) ? pet.breed : '';
  const isCustomBreed = pet.breed && !breedValue;

  return {
    id: pet.id ?? '',
    name: pet.name ?? '',
    species: speciesValue,
    custom_species: speciesValue === 'other' ? pet.species ?? '' : '',
    breed: isCustomBreed ? '其他' : breedValue,
    custom_breed: isCustomBreed ? pet.breed ?? '' : '',
    gender: pet.gender ?? '未知',
    birth_date: pet.birth_date ?? '',
    color: pet.color ?? '',
    weight_kg: pet.weight_kg ?? '',
    medical_notes: pet.medical_notes ?? '无',
    avatar_url: normalizePetAvatarUrl(pet.avatar_url),
    avatar_file: null,
    avatar_preview_url: '',
    avatar: pet.avatar ?? '🐾',
    neutered: Boolean(pet.neutered),
    vaccinated: Boolean(pet.vaccinated),
    is_public: Boolean(pet.is_public),
  };
}

export function validatePetForm(form) {
  if (!form.name.trim()) throw new Error('请填写宠物名字');
  if (!form.species) throw new Error('请选择宠物物种');
  if (form.species === 'other' && !form.custom_species.trim()) {
    throw new Error('请填写具体物种');
  }
  if (form.breed === '其他' && !form.custom_breed.trim()) {
    throw new Error('请填写具体品种');
  }
}

export function toPetPayload(form, userId, avatarUrl) {
  const species = form.species === 'other' ? form.custom_species.trim() : getSpeciesLabel(form.species);
  const breed = form.breed === '其他' ? form.custom_breed.trim() : form.breed.trim();

  return {
    user_id: userId,
    name: form.name.trim(),
    species,
    breed: breed || null,
    gender: form.gender || null,
    birth_date: form.birth_date || null,
    color: form.color.trim() || null,
    weight_kg: form.weight_kg === '' ? null : Number(form.weight_kg),
    medical_notes: form.medical_notes.trim() || '无',
    avatar_url: avatarUrl || null,
    avatar: form.avatar || '🐾',
    neutered: form.neutered,
    vaccinated: form.vaccinated,
    is_public: form.is_public,
  };
}
