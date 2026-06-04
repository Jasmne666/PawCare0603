import { getLocalDateString } from './stickerImage.js';

function getImageUrl(sticker) {
  return sticker.sticker_image_url || sticker.original_image_url;
}

function getMonthKey(date = new Date()) {
  return getLocalDateString(date).slice(0, 7);
}

async function loadRemoteImage(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('贴纸图片读取失败');
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('贴纸图片加载失败'));
    };
    image.src = objectUrl;
  });
}

function downloadCanvas(canvas, fileName) {
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = fileName;
  link.click();
}

export async function downloadMonthlyMemoryBook({ monthDate = new Date(), pet, stickers }) {
  const monthKey = getMonthKey(monthDate);
  const monthStickers = stickers.filter((sticker) => sticker.captured_date?.startsWith(monthKey)).slice(0, 12);
  if (!monthStickers.length) throw new Error('这个月还没有贴纸，先去记录解锁第一张吧。');

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#FDFAF4';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#2C1810';
  ctx.font = '700 68px serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${pet.name}的${Number(monthKey.slice(5))}月成长纪念册`, 540, 120);

  ctx.fillStyle = '#9E8E82';
  ctx.font = '400 30px sans-serif';
  ctx.fillText(`PawCare · 已收集 ${monthStickers.length} 张贴纸`, 540, 172);

  const cols = 3;
  const gap = 34;
  const cell = 292;
  const startX = 76;
  const startY = 250;

  const images = await Promise.all(monthStickers.map((sticker) => loadRemoteImage(getImageUrl(sticker))));
  images.forEach((image, index) => {
    const sticker = monthStickers[index];
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = startX + col * (cell + gap);
    const y = startY + row * (cell + 88);

    ctx.save();
    ctx.shadowColor = 'rgba(44,24,16,.16)';
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(x, y, cell, cell + 58, 30);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x + 16, y + 16, cell - 32, cell - 32, 24);
    ctx.clip();
    ctx.drawImage(image, x + 16, y + 16, cell - 32, cell - 32);
    ctx.restore();

    ctx.fillStyle = '#5C3D2E';
    ctx.font = '600 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(sticker.captured_date.slice(5).replace('-', '/'), x + cell / 2, y + cell + 24);
  });

  ctx.fillStyle = '#4A7C59';
  ctx.font = '700 34px sans-serif';
  ctx.fillText('每天一点点记录，都是认真爱它的证据', 540, 1510);

  downloadCanvas(canvas, `pawcare-${pet.name}-${monthKey}.png`);
}
