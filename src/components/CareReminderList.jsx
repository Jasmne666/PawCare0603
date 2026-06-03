const reminderStyles = {
  danger: 'border-paw-danger bg-paw-danger/10 text-paw-danger',
  info: 'border-paw-border bg-paw-background text-paw-secondary',
  warn: 'border-paw-warning bg-paw-warning/10 text-paw-secondary',
};

function CareReminderList({ reminders }) {
  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-paw-muted">照护提醒</p>
          <h2 className="font-title text-xl font-semibold">本周待关注</h2>
        </div>
        <span className="rounded-full bg-paw-healthy/10 px-3 py-1 text-xs font-semibold text-paw-healthy">
          {reminders.length || 0} 项
        </span>
      </div>

      {reminders.length ? (
        <div className="space-y-2">
          {reminders.map((reminder) => (
            <article
              className={`rounded-control border px-3 py-3 ${reminderStyles[reminder.type] || reminderStyles.info}`}
              key={reminder.title}
            >
              <div className="flex gap-3">
                <span className="text-lg">{reminder.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold">{reminder.title}</h3>
                  <p className="mt-1 text-xs leading-5 opacity-80">{reminder.desc}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-control bg-paw-background px-4 py-3 text-sm leading-6 text-paw-muted">
          暂时没有待处理提醒。继续保持记录，PawCare 会根据数据变化更新提醒。
        </p>
      )}
    </section>
  );
}

export default CareReminderList;
