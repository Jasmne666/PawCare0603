import { supabase } from './supabase.js';

const AVATAR_BUCKET = 'pet-avatars';
const PUBLIC_AVATAR_PATH = `/storage/v1/object/public/${AVATAR_BUCKET}/`;

export function normalizePetAvatarUrl(url) {
  const trimmedUrl = url?.trim() || '';
  if (!trimmedUrl) return '';

  try {
    const parsedUrl = new URL(trimmedUrl);
    const isSupabasePublicAvatar =
      parsedUrl.protocol === 'https:' && parsedUrl.pathname.includes(PUBLIC_AVATAR_PATH);

    return isSupabasePublicAvatar ? trimmedUrl : '';
  } catch {
    return '';
  }
}

function getSafeFileName(fileName) {
  const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
  const safeExtension = extension.replace(/[^a-z0-9]/g, '') || 'jpg';
  const randomId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${Date.now()}-${randomId}.${safeExtension}`;
}

export async function uploadPetAvatar(file, userId) {
  if (!file) return null;

  const path = `${userId}/${getSafeFileName(file.name)}`;
  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(`头像上传失败：${error.message}`);
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  const publicUrl = normalizePetAvatarUrl(data.publicUrl);
  if (!publicUrl) throw new Error('头像上传失败：无法生成公开访问链接');

  return publicUrl;
}
