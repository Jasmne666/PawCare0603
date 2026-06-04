import PetAvatarPicker from './PetAvatarPicker.jsx';

function PetAvatarSection({ form, setValue }) {
  const previewUrl = form.avatar_preview_url || form.avatar_url;

  const clearPreview = () => {
    if (form.avatar_preview_url?.startsWith('blob:')) {
      URL.revokeObjectURL(form.avatar_preview_url);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    clearPreview();
    setValue('avatar_file', file);
    setValue('avatar_preview_url', URL.createObjectURL(file));
    setValue('avatar_url', '');
    event.target.value = '';
  };

  const handleAvatarChange = (avatar) => {
    clearPreview();
    setValue('avatar', avatar);
    setValue('avatar_file', null);
    setValue('avatar_preview_url', '');
    setValue('avatar_url', '');
  };

  return (
    <section className="rounded-card border border-paw-border bg-white p-4">
      <div className="mb-3 text-sm font-semibold text-paw-primary">宠物头像</div>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-card border border-paw-border bg-paw-background text-3xl">
          {previewUrl ? (
            <img className="h-full w-full object-cover" src={previewUrl} alt="宠物头像预览" />
          ) : (
            <span>{form.avatar}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <label className="inline-flex cursor-pointer items-center rounded-control bg-paw-primary px-4 py-2 text-xs font-semibold text-paw-background transition hover:opacity-90">
            上传图片
            <input accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFileChange} type="file" />
          </label>
          <p className="mt-2 text-xs leading-5 text-paw-muted">JPG / PNG / WEBP / GIF，建议正方形图片。</p>
        </div>
      </div>
      <div className="mt-3">
        <PetAvatarPicker value={form.avatar} onChange={handleAvatarChange} />
      </div>
    </section>
  );
}

export default PetAvatarSection;
