import { useRef } from 'react';
import { Link } from 'react-router-dom';

function StickerPreview({ stickers }) {
  if (!stickers.length) {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control border border-dashed border-paw-border bg-paw-background text-lg">
        ✨
      </div>
    );
  }

  return (
    <div className="flex shrink-0 -space-x-3">
      {stickers.slice(0, 3).map((sticker) => (
        <img
          alt={sticker.title || '宠物贴纸'}
          className="h-11 w-11 rounded-control border-2 border-white object-cover shadow-sm"
          key={sticker.id}
          src={sticker.sticker_image_url || sticker.original_image_url}
        />
      ))}
    </div>
  );
}

function TodayStickerCard({ error, loading, onFileSelected, pet, stickers }) {
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const hasStickers = stickers.length > 0;

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) onFileSelected(file);
  };

  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-3.5">
      <div className="flex items-center gap-3">
        <StickerPreview stickers={stickers} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-title text-lg font-semibold">今日贴纸</h2>
            <span className="rounded-full bg-paw-healthy/10 px-2 py-0.5 text-[10px] font-semibold text-paw-healthy">
              {loading ? '读取中' : `${stickers.length}张`}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-paw-muted">
            {hasStickers ? `已收集 ${stickers.length} 张` : `给${pet.name}留一张可爱瞬间`}
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-control border border-paw-danger bg-paw-danger/10 px-3 py-2 text-xs text-paw-danger">
          {error}
        </p>
      )}

      <div className="mt-3 grid grid-cols-[1fr_1fr_auto] gap-2">
        <button
          className="rounded-control bg-paw-primary px-3 py-2 text-xs font-semibold text-paw-background"
          onClick={() => cameraRef.current?.click()}
          type="button"
        >
          拍一张
        </button>
        <button
          className="rounded-control border border-paw-border bg-paw-background px-3 py-2 text-xs font-semibold text-paw-secondary"
          onClick={() => galleryRef.current?.click()}
          type="button"
        >
          相册选
        </button>
        <Link
          className="rounded-control bg-paw-healthy/10 px-3 py-2 text-center text-xs font-semibold text-paw-healthy"
          to="/stickers"
        >
          贴纸册
        </Link>
      </div>

      <input accept="image/*" capture="environment" className="hidden" onChange={handleChange} ref={cameraRef} type="file" />
      <input accept="image/*" className="hidden" onChange={handleChange} ref={galleryRef} type="file" />
    </section>
  );
}

export default TodayStickerCard;
