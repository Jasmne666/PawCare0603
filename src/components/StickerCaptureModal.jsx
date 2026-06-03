import { useEffect, useState } from 'react';
import { createFallbackStickerImage } from '../utils/stickerImage.js';

function StickerCaptureModal({ defaultPetId, file, onClose, onSave, open, pets, saving }) {
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [petId, setPetId] = useState(defaultPetId || '');
  const [stickerUrl, setStickerUrl] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    setPetId(defaultPetId || '');
  }, [defaultPetId, open]);

  useEffect(() => {
    if (!open || !file) return undefined;
    let active = true;
    const sourceUrl = URL.createObjectURL(file);
    setOriginalUrl(sourceUrl);
    setStickerUrl('');
    setTitle('');
    setNote('');
    setError('');

    createFallbackStickerImage(file)
      .then((stickerFile) => {
        if (!active) return;
        setStickerUrl(URL.createObjectURL(stickerFile));
      })
      .catch((err) => {
        if (active) setError(err.message);
      });

    return () => {
      active = false;
      URL.revokeObjectURL(sourceUrl);
      setStickerUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return '';
      });
    };
  }, [file, open]);

  if (!open || !file) return null;

  const handleSave = async () => {
    setError('');
    try {
      await onSave({ file, note, petId, title });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-paw-primary/45 px-3 pb-3">
      <section className="mx-auto max-h-[88vh] w-full max-w-app overflow-y-auto rounded-t-[26px] bg-paw-card p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-paw-muted">今日贴纸</p>
            <h2 className="font-title text-2xl font-semibold">预览小贴纸</h2>
          </div>
          <button className="text-sm font-semibold text-paw-muted" onClick={onClose} type="button">
            取消
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <PreviewBox label="原图" src={originalUrl} />
          <PreviewBox label="贴纸效果" loading={!stickerUrl && !error} src={stickerUrl} />
        </div>

        <label className="mt-4 block text-sm font-semibold text-paw-secondary">
          选择宠物
          <select
            className="mt-2 w-full rounded-control border border-paw-border bg-paw-background px-4 py-3 text-sm outline-none focus:border-paw-healthy"
            onChange={(event) => setPetId(event.target.value)}
            value={petId}
          >
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block text-sm font-semibold text-paw-secondary">
          贴纸标题
          <input
            className="mt-2 w-full rounded-control border border-paw-border bg-paw-background px-4 py-3 text-sm outline-none focus:border-paw-healthy"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="例如：今天的可爱瞬间"
            value={title}
          />
        </label>

        <label className="mt-4 block text-sm font-semibold text-paw-secondary">
          备注
          <textarea
            className="mt-2 min-h-20 w-full resize-none rounded-control border border-paw-border bg-paw-background px-4 py-3 text-sm leading-6 outline-none focus:border-paw-healthy"
            onChange={(event) => setNote(event.target.value)}
            placeholder="可以写一句今天发生的小事"
            value={note}
          />
        </label>

        {error && (
          <p className="mt-4 rounded-control border border-paw-danger bg-paw-danger/10 px-4 py-3 text-sm text-paw-danger">
            {error}
          </p>
        )}

        <button
          className="mt-4 w-full rounded-card bg-paw-primary px-5 py-4 text-sm font-semibold text-paw-background disabled:opacity-60"
          disabled={saving || !petId || !stickerUrl}
          onClick={handleSave}
          type="button"
        >
          {saving ? '正在保存...' : '保存贴纸'}
        </button>
      </section>
    </div>
  );
}

function PreviewBox({ label, loading, src }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-paw-muted">{label}</p>
      <div className="flex aspect-square items-center justify-center rounded-card bg-paw-background">
        {src ? (
          <img alt={label} className="h-full w-full rounded-card object-cover" src={src} />
        ) : (
          <span className="text-xs text-paw-muted">{loading ? '生成中...' : '暂无预览'}</span>
        )}
      </div>
    </div>
  );
}

export default StickerCaptureModal;
