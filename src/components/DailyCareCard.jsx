import {
  dailyCareQuickActions,
  dailyCareSummaryFields,
  getDailyCareLabel,
} from '../data/dailyCareOptions.js';

function PetAvatar({ pet }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-card border border-paw-border bg-paw-background text-3xl">
      {pet.avatar_url ? (
        <img className="h-full w-full object-cover" src={pet.avatar_url} alt={pet.name} />
      ) : (
        pet.avatar || '🐾'
      )}
    </div>
  );
}

function StatusSummary({ record }) {
  if (!record) {
    return (
      <p className="mt-3 rounded-control bg-paw-background px-4 py-3 text-sm leading-6 text-paw-muted">
        今天还没有照护小报告。点一下快捷按钮就能记录。
      </p>
    );
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {dailyCareSummaryFields.map((field) => (
        <div className="rounded-control bg-paw-background px-3 py-2" key={field.key}>
          <p className="text-[11px] text-paw-muted">
            {field.icon} {field.label}
          </p>
          <p className="mt-1 truncate text-xs font-semibold text-paw-secondary">
            {getDailyCareLabel(field.key, record[field.key])}
          </p>
        </div>
      ))}
    </div>
  );
}

function DailyCareCard({
  error,
  feedback,
  loading,
  onQuickSave,
  pet,
  record,
  saving,
}) {
  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <PetAvatar pet={pet} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-paw-muted">今日照护</p>
            <h2 className="mt-1 truncate font-title text-2xl font-semibold">{pet.name}的小报告</h2>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-paw-healthy/10 px-3 py-1 text-xs font-semibold text-paw-healthy">
          {record ? '已记录' : '待记录'}
        </span>
      </div>

      <StatusSummary record={record} />

      {feedback && (
        <p className="mt-3 rounded-control border border-paw-healthy bg-paw-healthy/10 px-4 py-3 text-sm leading-6 text-paw-healthy">
          {feedback}
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-control border border-paw-danger bg-paw-danger/10 px-4 py-3 text-sm leading-6 text-paw-danger">
          {error}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        {dailyCareQuickActions.map((action) => (
          <button
            className="rounded-control border border-paw-border bg-paw-background px-3 py-3 text-left text-sm font-semibold text-paw-secondary transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading || saving}
            key={action.value}
            onClick={() => onQuickSave(action.value)}
            type="button"
          >
            <span className="mr-2 text-base">{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default DailyCareCard;
