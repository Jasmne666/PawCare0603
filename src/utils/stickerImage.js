export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getSafeImageName(prefix = 'pawcare-sticker') {
  const randomId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}-${Date.now()}-${randomId}.png`;
}

function drawStickerBlob(ctx, cx, cy, radius) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - radius * 0.96);
  ctx.bezierCurveTo(cx + radius * 0.55, cy - radius * 1.08, cx + radius * 1.03, cy - radius * 0.5, cx + radius * 0.92, cy);
  ctx.bezierCurveTo(cx + radius * 1.08, cy + radius * 0.55, cx + radius * 0.46, cy + radius * 1.04, cx, cy + radius * 0.94);
  ctx.bezierCurveTo(cx - radius * 0.56, cy + radius * 1.08, cx - radius * 1.04, cy + radius * 0.48, cx - radius * 0.92, cy);
  ctx.bezierCurveTo(cx - radius * 1.08, cy - radius * 0.58, cx - radius * 0.44, cy - radius * 1.02, cx, cy - radius * 0.96);
  ctx.closePath();
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片读取失败，请换一张照片试试'));
    };
    image.src = url;
  });
}

function getCoverRect(image, size) {
  const scale = Math.max(size / image.width, size / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  return {
    height,
    width,
    x: (size - width) / 2,
    y: (size - height) / 2,
  };
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('贴纸生成失败，请重试'));
    }, 'image/png');
  });
}

export async function createFallbackStickerImage(file) {
  const image = await loadImage(file);
  const canvas = document.createElement('canvas');
  const size = 960;
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);

  ctx.save();
  ctx.shadowColor = 'rgba(44, 24, 16, 0.2)';
  ctx.shadowBlur = 38;
  ctx.shadowOffsetY = 20;
  ctx.fillStyle = '#FFFFFF';
  drawStickerBlob(ctx, size / 2, size / 2, 390);
  ctx.fill();
  ctx.restore();

  ctx.save();
  drawStickerBlob(ctx, size / 2, size / 2, 350);
  ctx.clip();
  const rect = getCoverRect(image, 720);
  ctx.drawImage(image, rect.x + 120, rect.y + 120, rect.width, rect.height);
  ctx.restore();

  ctx.lineWidth = 44;
  ctx.strokeStyle = '#FFFFFF';
  drawStickerBlob(ctx, size / 2, size / 2, 372);
  ctx.stroke();

  const blob = await canvasToBlob(canvas);
  return new File([blob], getSafeImageName(), { type: 'image/png' });
}

export async function createRewardStickerImage({ meta, pet }) {
  const canvas = document.createElement('canvas');
  const size = 960;
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FDFAF4';
  ctx.fillRect(0, 0, size, size);

  ctx.save();
  ctx.shadowColor = 'rgba(44, 24, 16, 0.18)';
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 20;
  ctx.fillStyle = '#FFFFFF';
  drawStickerBlob(ctx, size / 2, size / 2, 380);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = meta.accent;
  drawStickerBlob(ctx, size / 2, size / 2, 330);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 150px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(pet.avatar || meta.emoji, size / 2, 350);

  ctx.font = '700 62px sans-serif';
  ctx.fillText(meta.series, size / 2, 520);

  ctx.font = '500 42px sans-serif';
  ctx.fillText(meta.title.slice(0, 12), size / 2, 590);

  ctx.lineWidth = 38;
  ctx.strokeStyle = '#FFFFFF';
  drawStickerBlob(ctx, size / 2, size / 2, 355);
  ctx.stroke();

  const blob = await canvasToBlob(canvas);
  return new File([blob], getSafeImageName('pawcare-reward-sticker'), { type: 'image/png' });
}
