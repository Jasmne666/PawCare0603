import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import PetSwitcher from '../components/PetSwitcher.jsx';
import StickerGallery from '../components/StickerGallery.jsx';
import { usePetStickers } from '../hooks/usePetStickers.js';
import { usePets } from '../hooks/usePets.js';
import { downloadMonthlyMemoryBook } from '../utils/monthlyMemoryBook.js';

function LoadingCard({ title }) {
  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-5">
      <p className="text-sm font-medium text-paw-muted">贴纸册</p>
      <h1 className="mt-2 font-title text-3xl font-semibold">{title}</h1>
    </section>
  );
}

function Stickers() {
  const navigate = useNavigate();
  const [notice, setNotice] = useState('');
  const { activePetId, error: petError, loading: petLoading, pet, pets, selectPet } = usePets();
  const {
    deleteSticker,
    error: stickerError,
    loading: stickerLoading,
    markStickerPublic,
    recentStickers,
    toggleFavorite,
  } = usePetStickers(pet?.id);

  const handlePublish = async (sticker) => {
    await markStickerPublic(sticker.id);
    navigate('/cloud', {
      state: {
        defaultContent: '今天也收集到一张可爱贴纸 ✨',
        stickerId: sticker.id,
        stickerImageUrl: sticker.sticker_image_url || sticker.original_image_url,
      },
    });
  };

  const handleDownloadBook = async () => {
    setNotice('');
    try {
      await downloadMonthlyMemoryBook({ pet, stickers: recentStickers });
    } catch (err) {
      setNotice(err.message);
    }
  };

  if (petLoading) return <LoadingCard title="正在读取宠物档案" />;
  if (!pet) {
    return (
      <section className="rounded-card border border-paw-border bg-paw-card p-5">
        <p className="text-sm font-medium text-paw-muted">贴纸册</p>
        <h1 className="mt-2 font-title text-3xl font-semibold">请先创建宠物档案</h1>
        <Link
          className="mt-5 inline-flex rounded-control bg-paw-primary px-4 py-3 text-sm font-semibold text-paw-background"
          to="/profile"
        >
          去创建档案
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section>
        <p className="text-sm font-medium text-paw-muted">贴纸册</p>
        <h1 className="mt-2 font-title text-3xl font-semibold">{pet.name}的小贴纸</h1>
        <p className="mt-2 text-sm leading-6 text-paw-muted">
          保存每天的可爱瞬间，也可以一键发布到云遛宠。
        </p>
      </section>

      <PetSwitcher activePetId={activePetId} label="当前宠物" onSelectPet={selectPet} pets={pets} />

      <section className="rounded-card border border-paw-healthy/30 bg-paw-healthy/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-paw-healthy">月度成长纪念册</p>
            <h2 className="mt-1 text-sm font-semibold text-paw-primary">把这个月的贴纸生成一张分享图</h2>
          </div>
          <button
            className="shrink-0 rounded-control bg-paw-primary px-3 py-2 text-xs font-semibold text-paw-background"
            onClick={handleDownloadBook}
            type="button"
          >
            生成
          </button>
        </div>
      </section>

      {(petError || stickerError) && (
        <section className="rounded-card border border-paw-danger bg-paw-danger/10 p-4 text-sm text-paw-danger">
          {petError || stickerError}
        </section>
      )}

      {notice && (
        <section className="rounded-card border border-paw-warning bg-paw-warning/10 p-4 text-sm text-paw-secondary">
          {notice}
        </section>
      )}

      {stickerLoading ? (
        <LoadingCard title="正在打开贴纸册" />
      ) : (
        <StickerGallery
          onDelete={deleteSticker}
          onFavorite={toggleFavorite}
          onNotice={setNotice}
          onPublish={handlePublish}
          petName={pet.name}
          stickers={recentStickers}
        />
      )}
    </div>
  );
}

export default Stickers;
