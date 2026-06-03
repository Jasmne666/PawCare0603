import { calcPetAge } from '../utils/petAge.js';

function PetProfileHeader({ email, form, onSignOut }) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-paw-muted">宠物档案</p>
        <h1 className="mt-1 font-title text-3xl font-semibold">
          {form.name || '创建宠物档案'}
        </h1>
        <p className="mt-2 text-sm text-paw-muted">
          {email || '当前账号'} · {calcPetAge(form.birth_date)}
        </p>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="rounded-control border border-paw-border bg-paw-card px-3 py-2 text-sm font-semibold text-paw-muted"
      >
        退出
      </button>
    </header>
  );
}

export default PetProfileHeader;

