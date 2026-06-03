import { getLocalDateString } from '../utils/stickerImage.js';

function getYesterday() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return getLocalDateString(date);
}

function getStickerSrc(sticker) {
  return sticker.sticker_image_url || sticker.original_image_url;
}

async function downloadSticker(sticker, petName, onNotice) {
  try {
    const response = await fetch(getStickerSrc(sticker));
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pawcare-${petName}-${sticker.captured_date}.png`;
    link.click();
    URL.revokeObjectURL(url);
  } catch {
    onNotice('当前浏览器不支持直接下载，长按图片即可保存到相册。');
  }
}

function StickerCard({ onDelete, onFavorite, onNotice, onPublish, petName, sticker }) {
  return (
    <article className="rounded-card border border-paw-border bg-paw-card p-3">
      <img
        alt={sticker.title || '宠物贴纸'}
        className="aspect-square w-full rounded-card border-4 border-white object-cover shadow-md"
        src={getStickerSrc(sticker)}
      />
      <div className="mt-3">
        <p className="truncate text-sm font-semibold text-paw-primary">
          {sticker.title || '今天的可爱贴纸'}
        </p>
        <p className="mt-1 text-[11px] text-paw-muted">{sticker.captured_date}</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-semibold">
        <button className="rounded-control bg-paw-background px-2 py-2" onClick={() => onFavorite(sticker)} type="button">
          {sticker.is_favorite ? '已收藏' : '收藏'}
        </button>
        <button
          className="rounded-control bg-paw-background px-2 py-2"
          onClick={() => downloadSticker(sticker, petName, onNotice)}
          type="button"
        >
          保存
        </button>
        <button className="rounded-control bg-paw-healthy/10 px-2 py-2 text-paw-healthy" onClick={() => onPublish(sticker)} type="button">
          云遛宠
        </button>
        <button className="rounded-control bg-paw-danger/10 px-2 py-2 text-paw-danger" onClick={() => onDelete(sticker.id)} type="button">
          删除
        </button>
      </div>
    </article>
  );
}

function StickerGroup({ emptyText, onDelete, onFavorite, onNotice, onPublish, petName, stickers, title }) {
  return (
    <section>
      <h2 className="mb-3 font-title text-2xl font-semibold">{title}</h2>
      {stickers.length ? (
        <div className="grid grid-cols-2 gap-3">
          {stickers.map((sticker) => (
            <StickerCard
              key={sticker.id}
              onDelete={onDelete}
              onFavorite={onFavorite}
              onNotice={onNotice}
              onPublish={onPublish}
              petName={petName}
              sticker={sticker}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-card border border-paw-border bg-paw-card p-5 text-sm leading-6 text-paw-muted">
          {emptyText}
        </p>
      )}
    </section>
  );
}

function StickerGallery({ onDelete, onFavorite, onNotice, onPublish, petName, stickers }) {
  const today = getLocalDateString();
  const yesterday = getYesterday();
  const todayStickers = stickers.filter((sticker) => sticker.captured_date === today);
  const yesterdayStickers = stickers.filter((sticker) => sticker.captured_date === yesterday);
  const recentStickers = stickers.filter(
    (sticker) => sticker.captured_date !== today && sticker.captured_date !== yesterday,
  );

  return (
    <div className="space-y-6">
      <StickerGroup
        emptyText="今天还没有贴纸，拍下它的可爱瞬间吧 ✨"
        onDelete={onDelete}
        onFavorite={onFavorite}
        onNotice={onNotice}
        onPublish={onPublish}
        petName={petName}
        stickers={todayStickers}
        title="今天"
      />
      <StickerGroup
        emptyText="昨天没有收集贴纸，今天补一张也不晚 🐾"
        onDelete={onDelete}
        onFavorite={onFavorite}
        onNotice={onNotice}
        onPublish={onPublish}
        petName={petName}
        stickers={yesterdayStickers}
        title="昨天"
      />
      <StickerGroup
        emptyText="贴纸册空空的，第一张就从今天开始吧"
        onDelete={onDelete}
        onFavorite={onFavorite}
        onNotice={onNotice}
        onPublish={onPublish}
        petName={petName}
        stickers={recentStickers}
        title="最近"
      />
    </div>
  );
}

export default StickerGallery;
