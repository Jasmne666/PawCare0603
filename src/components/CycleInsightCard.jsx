function CycleInsightCard({ notes }) {
  if (!notes.length) return null;

  return (
    <section className="rounded-card border border-paw-warning/40 bg-paw-warning/10 p-4">
      <div className="flex gap-3">
        <span className="text-xl">📌</span>
        <div>
          <h2 className="text-sm font-semibold text-paw-secondary">特殊周期提示</h2>
          <div className="mt-2 space-y-1">
            {notes.map((note) => (
              <p className="text-xs leading-5 text-paw-muted" key={note}>
                {note}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CycleInsightCard;
