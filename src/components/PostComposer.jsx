import { useEffect, useMemo, useState } from 'react';

function PostComposer({ open, onClose, onSubmit, pet, saving, type = 'normal' }) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [publishPet, setPublishPet] = useState(true);
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(
    () => () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    },
    [previews],
  );

  if (!open) return null;

  const reset = () => {
    setContent('');
    setFiles([]);
    setPublishPet(true);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    await onSubmit({ content, files, publishPet, type });
    reset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-paw-primary/40 px-4 pb-4">
      <section className="mx-auto w-full max-w-app rounded-card bg-paw-card p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-paw-muted">{type === 'cloud_walk' ? '云遛宠' : '社区'}</p>
            <h2 className="font-title text-2xl font-semibold">发布动态</h2>
          </div>
          <button className="text-sm font-semibold text-paw-muted" onClick={handleClose} type="button">
            关闭
          </button>
        </div>

        <textarea
          className="min-h-28 w-full resize-none rounded-control border border-paw-border bg-paw-background px-4 py-3 text-sm leading-6 outline-none focus:border-paw-healthy"
          onChange={(event) => setContent(event.target.value)}
          placeholder={type === 'cloud_walk' ? '分享一段云遛宠日常...' : '分享宠物今天的新鲜事...'}
          value={content}
        />

        {previews.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {previews.map((src) => (
              <img className="aspect-square rounded-control object-cover" key={src} src={src} alt="帖子图片预览" />
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <label className="cursor-pointer rounded-control border border-paw-border px-4 py-2 text-xs font-semibold text-paw-secondary">
            添加图片
            <input
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 6))}
              type="file"
            />
          </label>
          <span className="text-xs text-paw-muted">{files.length}/6</span>
        </div>

        {pet && (
          <label className="mt-4 flex items-center justify-between rounded-control bg-paw-background px-4 py-3 text-sm text-paw-secondary">
            <span>公开展示 {pet.name}，方便别人关注</span>
            <input
              checked={publishPet}
              className="h-4 w-4 accent-paw-healthy"
              onChange={(event) => setPublishPet(event.target.checked)}
              type="checkbox"
            />
          </label>
        )}

        <button
          className="mt-4 w-full rounded-card bg-paw-primary px-5 py-4 text-sm font-semibold text-paw-background disabled:opacity-60"
          disabled={saving}
          onClick={handleSubmit}
          type="button"
        >
          {saving ? '正在发布...' : '发布'}
        </button>
      </section>
    </div>
  );
}

export default PostComposer;
