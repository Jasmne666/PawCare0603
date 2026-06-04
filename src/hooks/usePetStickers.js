import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPetStickerFromImage } from '../lib/petStickerGeneration.js';
import { supabase } from '../lib/supabase.js';
import { createRewardStickerImage, getLocalDateString } from '../utils/stickerImage.js';
import { getRewardStickerMeta, isRewardStickerUnlocked } from '../utils/stickerRewards.js';
import { useAuth } from './useAuth.js';

const ORIGINAL_BUCKET = 'pet-sticker-originals';
const STICKER_BUCKET = 'pet-stickers';

function getSafeFileName(fileName, fallbackExt = 'jpg') {
  const extension = fileName.split('.').pop()?.toLowerCase() || fallbackExt;
  const safeExtension = extension.replace(/[^a-z0-9]/g, '') || fallbackExt;
  const randomId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${Date.now()}-${randomId}.${safeExtension}`;
}

function getFriendlyError(error) {
  const message = error?.message || '';
  if (message.toLowerCase().includes('bucket not found')) {
    return '贴纸上传失败：请先创建 pet-sticker-originals 和 pet-stickers bucket。';
  }
  if (message.includes('pet_stickers')) {
    return '贴纸数据表还没创建。请先运行 supabase/pet_stickers.sql。';
  }
  return message || '贴纸操作失败';
}

async function uploadStickerFile({ bucket, file, path }) {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error('贴纸上传失败：无法生成公开访问链接');
  return data.publicUrl;
}

export function usePetStickers(activePetId) {
  const { user } = useAuth();
  const [todayStickers, setTodayStickers] = useState([]);
  const [recentStickers, setRecentStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const today = useMemo(() => getLocalDateString(), []);

  const loadStickersByDate = useCallback(
    async (petId = activePetId, date = today) => {
      if (!user || !petId) return [];
      const { data, error: queryError } = await supabase
        .from('pet_stickers')
        .select('*')
        .eq('user_id', user.id)
        .eq('pet_id', petId)
        .eq('captured_date', date)
        .order('created_at', { ascending: false });
      if (queryError) throw queryError;
      return data ?? [];
    },
    [activePetId, today, user],
  );

  const loadRecentStickers = useCallback(
    async (petId = activePetId, limit = 30) => {
      if (!user || !petId) return [];
      const { data, error: queryError } = await supabase
        .from('pet_stickers')
        .select('*')
        .eq('user_id', user.id)
        .eq('pet_id', petId)
        .order('captured_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);
      if (queryError) throw queryError;
      return data ?? [];
    },
    [activePetId, user],
  );

  const refresh = useCallback(async () => {
    if (!user || !activePetId) {
      setTodayStickers([]);
      setRecentStickers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [todayRows, recentRows] = await Promise.all([
        loadStickersByDate(activePetId, today),
        loadRecentStickers(activePetId, 36),
      ]);
      setTodayStickers(todayRows);
      setRecentStickers(recentRows);
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  }, [activePetId, loadRecentStickers, loadStickersByDate, today, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveSticker = useCallback(
    async ({ file, note, petId = activePetId, title }) => {
      if (!user) throw new Error('请先登录');
      if (!petId) throw new Error('请先选择宠物');
      if (!file) throw new Error('请先选择一张照片');
      setSaving(true);
      setError('');

      try {
        const date = getLocalDateString();
        const basePath = `${user.id}/${petId}/${date}`;
        const originalPath = `${basePath}/${getSafeFileName(file.name)}`;
        const stickerFile = await createPetStickerFromImage(file);
        const stickerPath = `${basePath}/${getSafeFileName(stickerFile.name, 'png')}`;
        const [originalUrl, stickerUrl] = await Promise.all([
          uploadStickerFile({ bucket: ORIGINAL_BUCKET, file, path: originalPath }),
          uploadStickerFile({ bucket: STICKER_BUCKET, file: stickerFile, path: stickerPath }),
        ]);
        const { data, error: insertError } = await supabase
          .from('pet_stickers')
          .insert({
            captured_date: date,
            note: note?.trim() || null,
            original_image_url: originalUrl,
            pet_id: petId,
            processing_status: 'fallback',
            sticker_image_url: stickerUrl,
            title: title?.trim() || null,
            user_id: user.id,
          })
          .select('*')
          .single();
        if (insertError) throw insertError;
        await refresh();
        return data;
      } catch (err) {
        const message = getFriendlyError(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [activePetId, refresh, user],
  );

  const saveRewardSticker = useCallback(
    async ({ date = today, pet, record }) => {
      if (!user) throw new Error('请先登录');
      if (!pet?.id) throw new Error('请先选择宠物');
      if (!isRewardStickerUnlocked(record)) return null;

      const existing = await loadStickersByDate(pet.id, date);
      if (existing.length) return existing[0];

      setSaving(true);
      setError('');

      try {
        const meta = getRewardStickerMeta(record, pet);
        const stickerFile = await createRewardStickerImage({ meta, pet });
        const basePath = `${user.id}/${pet.id}/${date}`;
        const stickerPath = `${basePath}/${getSafeFileName(stickerFile.name, 'png')}`;
        const stickerUrl = await uploadStickerFile({ bucket: STICKER_BUCKET, file: stickerFile, path: stickerPath });
        const { data, error: insertError } = await supabase
          .from('pet_stickers')
          .insert({
            captured_date: date,
            note: meta.note,
            original_image_url: stickerUrl,
            pet_id: pet.id,
            processing_status: 'fallback',
            sticker_image_url: stickerUrl,
            title: meta.title,
            user_id: user.id,
          })
          .select('*')
          .single();
        if (insertError) throw insertError;
        await refresh();
        return data;
      } catch (err) {
        const message = getFriendlyError(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [loadStickersByDate, refresh, today, user],
  );

  const updateSticker = useCallback(
    async (stickerId, patch) => {
      if (!user) throw new Error('请先登录');
      const { data, error: updateError } = await supabase
        .from('pet_stickers')
        .update(patch)
        .eq('id', stickerId)
        .eq('user_id', user.id)
        .select('*')
        .single();
      if (updateError) throw updateError;
      await refresh();
      return data;
    },
    [refresh, user],
  );

  const deleteSticker = useCallback(
    async (stickerId) => {
      if (!user) throw new Error('请先登录');
      const { error: deleteError } = await supabase
        .from('pet_stickers')
        .delete()
        .eq('id', stickerId)
        .eq('user_id', user.id);
      if (deleteError) throw deleteError;
      await refresh();
    },
    [refresh, user],
  );

  return useMemo(
    () => ({
      deleteSticker,
      error,
      loadRecentStickers,
      loadStickersByDate,
      loadTodayStickers: () => loadStickersByDate(activePetId, today),
      loading,
      markStickerPublic: (stickerId) => updateSticker(stickerId, { is_public: true }),
      recentStickers,
      refresh,
      saveSticker,
      saveRewardSticker,
      saving,
      todayStickers,
      toggleFavorite: (sticker) => updateSticker(sticker.id, { is_favorite: !sticker.is_favorite }),
    }),
    [
      activePetId,
      deleteSticker,
      error,
      loadRecentStickers,
      loadStickersByDate,
      loading,
      recentStickers,
      refresh,
      saveSticker,
      saveRewardSticker,
      saving,
      today,
      todayStickers,
      updateSticker,
    ],
  );
}
