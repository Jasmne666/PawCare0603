import { Link } from 'react-router-dom';
import { getDaysUntil } from '../utils/todoDates.js';

function getUrgency(reminder) {
  const days = getDaysUntil(reminder.scheduled_date);
  if (days <= 0) return { line: 'border-l-[#D95F5F]', text: '今天！', tone: 'text-[#D95F5F]' };
  if (days <= 3) return { line: 'border-l-[#E8A020]', text: `${days}天后`, tone: 'text-[#E8A020]' };
  if (days <= 7) return { line: 'border-l-[#4A7C59]', text: `${days}天后`, tone: 'text-[#4A7C59]' };
  return { line: 'border-l-[#DDD3C4]', text: `${days}天后`, tone: 'text-paw-muted' };
}

function ReminderRow({ reminder }) {
  const urgency = getUrgency(reminder);

  return (
    <article className={`rounded-control border border-paw-border border-l-4 bg-paw-background px-3 py-3 ${urgency.line}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-paw-primary">{reminder.title}</p>
          <p className="mt-1 text-[11px] text-paw-muted">
            {reminder.scheduled_date?.slice(5).replace('-', '月')}日{reminder.note ? ` · ${reminder.note}` : ''}
          </p>
        </div>
        <span className={`shrink-0 text-xs font-semibold ${urgency.tone}`}>{urgency.text}</span>
      </div>
    </article>
  );
}

function HealthScheduleCard({ error, loading, reminders }) {
  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-paw-muted">按紧迫程度排序</p>
          <h2 className="font-title text-xl font-semibold text-paw-primary">健康日程</h2>
        </div>
        <Link className="rounded-control bg-paw-primary px-3 py-2 text-xs font-semibold text-paw-background" to="/profile">
          + 新增
        </Link>
      </div>

      {error && (
        <p className="rounded-control border border-paw-danger bg-paw-danger/10 px-3 py-2 text-xs text-paw-danger">
          {error}
        </p>
      )}

      <div className="space-y-2">
        {loading ? (
          <p className="rounded-control bg-paw-background px-4 py-3 text-sm text-paw-muted">正在读取健康日程...</p>
        ) : reminders.length ? (
          reminders.map((reminder) => <ReminderRow key={reminder.id} reminder={reminder} />)
        ) : (
          <Link className="block rounded-control bg-paw-background px-4 py-4 text-sm text-paw-muted" to="/profile">
            暂无待办 ✓ 点击+新增提醒
          </Link>
        )}
      </div>
    </section>
  );
}

export default HealthScheduleCard;
