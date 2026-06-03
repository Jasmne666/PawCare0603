import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  toPetForm,
  toPetPayload,
  validatePetForm,
} from '../lib/petForm.js';
import { normalizePetAvatarUrl, uploadPetAvatar } from '../lib/petAvatarStorage.js';
import { supabase } from '../lib/supabase.js';
import { useAuth } from './useAuth.js';

const ACTIVE_PET_KEY_PREFIX = 'pawcare_active_pet_id';

export { emptyPetForm } from '../lib/petForm.js';

function getActivePetStorageKey(userId) {
  return `${ACTIVE_PET_KEY_PREFIX}:${userId}`;
}

function readActivePetId(userId) {
  if (!userId) return '';
  return localStorage.getItem(getActivePetStorageKey(userId)) || '';
}

function persistActivePetId(userId, petId) {
  if (!userId || !petId) return;
  localStorage.setItem(getActivePetStorageKey(userId), petId);
}

export function usePets() {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [activePetId, setActivePetId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const pet = useMemo(
    () => pets.find((item) => item.id === activePetId) || pets[0] || null,
    [activePetId, pets],
  );
  const petForm = useMemo(() => toPetForm(pet), [pet]);

  const loadPet = useCallback(async () => {
    if (!user) {
      setPets([]);
      setActivePetId('');
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
        .order('created_at', { ascending: true });

      if (queryError) throw queryError;
      const rows = data ?? [];
      const savedPetId = readActivePetId(user.id);
      const nextActivePetId = rows.some((row) => row.id === savedPetId)
        ? savedPetId
        : rows[0]?.id || '';

      setPets(rows);
      setActivePetId(nextActivePetId);
      persistActivePetId(user.id, nextActivePetId);
    } catch (err) {
      setError(err.message || '读取宠物档案失败');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPet();
  }, [loadPet]);

  const selectPet = useCallback(
    (petId) => {
      if (!user || !pets.some((item) => item.id === petId)) return;
      setActivePetId(petId);
      persistActivePetId(user.id, petId);
    },
    [pets, user],
  );

  const savePet = useCallback(
    async (form) => {
      if (!user) throw new Error('请先登录');
      validatePetForm(form);

      setSaving(true);
      setError('');

      try {
        const avatarUrl = form.avatar_file
          ? await uploadPetAvatar(form.avatar_file, user.id)
          : normalizePetAvatarUrl(form.avatar_url);
        const payload = toPetPayload(form, user.id, avatarUrl);
        const query = form.id
          ? supabase.from('pets').update(payload).eq('id', form.id).select('*')
          : supabase.from('pets').insert(payload).select('*');

        const { data, error: saveError } = await query.single();
        if (saveError) throw saveError;

        setPets((current) => {
          const exists = current.some((item) => item.id === data.id);
          return exists
            ? current.map((item) => (item.id === data.id ? data : item))
            : [...current, data];
        });
        setActivePetId(data.id);
        persistActivePetId(user.id, data.id);
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
      activePetId,
      formFromPet: toPetForm,
      loadPet,
      pet,
      petForm,
      pets,
      loading,
      saving,
      error,
      savePet,
      selectPet,
    }),
    [activePetId, error, loadPet, loading, pet, petForm, pets, savePet, saving, selectPet],
  );
}
