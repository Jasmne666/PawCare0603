import { createFallbackStickerImage } from '../utils/stickerImage.js';
import { supabase } from './supabase.js';

function base64ToFile(base64, fileName) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new File([bytes], fileName, { type: 'image/png' });
}

export async function createPetStickerFromImage(file) {
  try {
    const form = new FormData();
    form.append('image', file);
    const { data, error } = await supabase.functions.invoke('generate-pet-sticker', { body: form });
    if (error || !data?.imageBase64) throw error || new Error('贴纸服务暂不可用');
    return base64ToFile(data.imageBase64, `pawcare-ai-sticker-${Date.now()}.png`);
  } catch {
    return createFallbackStickerImage(file);
  }
}
