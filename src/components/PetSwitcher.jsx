function PetAvatar({ pet }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-control border border-paw-border bg-paw-background text-xl">
      {pet.avatar_url ? (
        <img className="h-full w-full object-cover" src={pet.avatar_url} alt={pet.name} />
      ) : (
        pet.avatar || '🐾'
      )}
    </span>
  );
}

function PetSwitcher({ activePetId, label = '当前宠物', onCreatePet, onSelectPet, pets = [] }) {
  if (!pets.length && !onCreatePet) return null;

  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-paw-muted">{label}</p>
          <p className="mt-1 text-xs text-paw-muted">{pets.length ? `${pets.length} 只宠物` : '还没有宠物'}</p>
        </div>
        {onCreatePet && (
          <button
            className="shrink-0 rounded-control bg-paw-primary px-3 py-2 text-xs font-semibold text-paw-background"
            onClick={onCreatePet}
            type="button"
          >
            + 新建
          </button>
        )}
      </div>

      {pets.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {pets.map((pet) => {
            const active = pet.id === activePetId;
            return (
              <button
                className={`flex shrink-0 items-center gap-2 rounded-card border px-3 py-2 text-left transition ${
                  active
                    ? 'border-paw-healthy bg-paw-healthy/10 text-paw-primary'
                    : 'border-paw-border bg-paw-background text-paw-muted'
                }`}
                key={pet.id}
                onClick={() => onSelectPet?.(pet.id)}
                type="button"
              >
                <PetAvatar pet={pet} />
                <span className="max-w-24 truncate text-sm font-semibold">{pet.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default PetSwitcher;
