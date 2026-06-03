import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from './useAuth.js';

export const emptyPetForm = {
  id: '',
  name: '',
  species: '猫',
  breed: '',
  gender: '未知',
  birth_date: '',
  color: '',
  weight_kg: '',
  medical_notes: '无',
  avatar_url: '',
  avatar: '🐾',
  neutered: false,
  vaccinated: false,
  is_public: false,
};

function toForm(pet) {
  if (!pet) return emptyPetForm;

  return {
    id: pet.id ?? '',
    name: pet.name ?? '',
    species: pet.species ?? '猫',
    breed: pet.breed ?? '',
    gender: pet.gender ?? '未知',
    birth_date: pet.birth_date ?? '',
    color: pet.color ?? '',
    weight_kg: pet.weight_kg ?? '',
    medical_notes: pet.medical_notes ?? '无',
    avatar_url: pet.avatar_url ?? '',
    avatar: pet.avatar ?? '🐾',
    neutered: Boolean(pet.neutered),
    vaccinated: Boolean(pet.vaccinated),
    is_public: Boolean(pet.is_public),
  };
}

function toPayload(form, userId) {
  return {
    user_id: userId,
    name: form.name.trim(),
    species: form.species,
    breed: form.breed.trim() || null,
    gender: form.gender || null,
    birth_date: form.birth_date || null,
    color: form.color.trim() || null,
    weight_kg: form.weight_kg === '' ? null : Number(form.weight_kg),
    medical_notes: form.medical_notes.trim() || '无',
    avatar_url: form.avatar_url.trim() || null,
    avatar: form.avatar || '🐾',
    neutered: form.neutered,
    vaccinated: form.vaccinated,
    is_public: form.is_public,
  };
}

export function usePets() {
  const { user } = useAuth();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadPet = useCallback(async () => {
    if (!user) {
      setPet(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: queryError } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (queryError) throw queryError;
      setPet(data ?? null);
    } catch (err) {
      setError(err.message || '读取宠物档案失败');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPet();
  }, [loadPet]);

  const savePet = useCallback(
    async (form) => {
      if (!user) throw new Error('请先登录');
      if (!form.name.trim()) throw new Error('请填写宠物名字');

      setSaving(true);
      setError('');

      try {
        const payload = toPayload(form, user.id);
        const query = form.id
          ? supabase.from('pets').update(payload).eq('id', form.id).select('*')
          : supabase.from('pets').insert(payload).select('*');

        const { data, error: saveError } = await query.single();
        if (saveError) throw saveError;

        setPet(data);
        return data;
      } catch (err) {
        const message = err.message || '保存宠物档案失败';
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [user],
  );

  return useMemo(
    () => ({
      formFromPet: toForm,
      loadPet,
      pet,
      petForm: toForm(pet),
      loading,
      saving,
      error,
      savePet,
    }),
    [error, loadPet, loading, pet, savePet, saving],
  );
}

