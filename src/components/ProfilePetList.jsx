function PetAvatar({ pet }) {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-card border border-paw-border bg-paw-background text-3xl">
      {pet.avatar_url ? (
        <img className="h-full w-full object-cover" src={pet.avatar_url} alt={pet.name} />
      ) : (
        pet.avatar || '🐾'
      )}
    </div>
  );
}

function PetListCard({ onEdit, pet }) {
  return (
    <article className="rounded-card border border-paw-border bg-paw-card p-4">
      <div className="flex items-center gap-3">
        <PetAvatar pet={pet} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-title text-xl font-semibold">{pet.name}</h3>
          <p className="mt-1 truncate text-xs text-paw-muted">
            {pet.species} · {pet.breed || '未填写品种'} · {pet.weight_kg ? `${pet.weight_kg}kg` : '未填体重'}
          </p>
        </div>
        <button
          className="shrink-0 rounded-control border border-paw-border bg-paw-background px-3 py-2 text-xs font-semibold text-paw-secondary"
          onClick={() => onEdit(pet)}
          type="button"
        >
          编辑档案
        </button>
      </div>
    </article>
  );
}

function ProfilePetList({ onAdd, onEdit, pets }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-title text-2xl font-semibold">我的宠物</h2>
        <button
          className="rounded-control bg-paw-primary px-3 py-2 text-xs font-semibold text-paw-background"
          onClick={onAdd}
          type="button"
        >
          + 添加宠物
        </button>
      </div>
      {pets.length ? (
        pets.map((pet) => <PetListCard key={pet.id} onEdit={onEdit} pet={pet} />)
      ) : (
        <p className="rounded-card border border-paw-border bg-paw-card p-5 text-sm text-paw-muted">
          还没有宠物档案，先添加一只宠物吧。
        </p>
      )}
    </section>
  );
}

export default ProfilePetList;
