import { supabase } from './supabase.js';

const POST_IMAGE_BUCKET = 'post-images';
const PUBLIC_POST_IMAGE_PATH = `/storage/v1/object/public/${POST_IMAGE_BUCKET}/`;

function getSafeFileName(fileName) {
  const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
  const safeExtension = extension.replace(/[^a-z0-9]/g, '') || 'jpg';
  const randomId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${Date.now()}-${randomId}.${safeExtension}`;
}

function normalizePostImageUrl(url) {
  const trimmedUrl = url?.trim() || '';
  if (!trimmedUrl) return '';

  try {
    const parsedUrl = new URL(trimmedUrl);
    const isPublicPostImage =
      parsedUrl.protocol === 'https:' && parsedUrl.pathname.includes(PUBLIC_POST_IMAGE_PATH);
    return isPublicPostImage ? trimmedUrl : '';
  } catch {
    return '';
  }
}

export async function uploadPostImages(files, userId) {
  const urls = [];

  for (const file of files) {
    const path = `${userId}/${getSafeFileName(file.name)}`;
    const { error } = await supabase.storage.from(POST_IMAGE_BUCKET).upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      const message = error.message?.toLowerCase().includes('bucket not found')
        ? '图片上传失败：请在 Supabase Storage 创建 post-images bucket'
        : `图片上传失败：${error.message}`;
      throw new Error(message);
    }

    const { data } = supabase.storage.from(POST_IMAGE_BUCKET).getPublicUrl(path);
    const publicUrl = normalizePostImageUrl(data.publicUrl);
    if (!publicUrl) throw new Error('图片上传失败：无法生成公开访问链接');
    urls.push(publicUrl);
  }

  return urls;
}
