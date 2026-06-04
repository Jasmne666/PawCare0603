import { Link } from 'react-router-dom';

function MetricBox({ icon, label, value }) {
  return (
    <div className="rounded-control bg-paw-background px-3 py-3 text-center">
      <p className="text-lg">{icon}</p>
      <p className="mt-1 text-[11px] text-paw-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-paw-primary">{value}</p>
    </div>
  );
}

function HealthLogDayDetail({ dateKey, log }) {
  if (!log) {
    return (
      <section className="rounded-card border border-paw-border bg-paw-card p-4">
        <p className="text-sm font-semibold text-paw-primary">{dateKey}</p>
        <p className="mt-2 text-sm text-paw-muted">这天还没有记录</p>
        <Link
          className="mt-4 inline-flex rounded-control bg-paw-primary px-4 py-2.5 text-sm font-semibold text-paw-background"
          to={`/log?date=${dateKey}`}
        >
          补录
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-paw-primary">{dateKey}</p>
          <p className="mt-1 text-xs text-paw-muted">当天完整记录</p>
        </div>
        <span className="text-2xl">{log.mood || '😐'}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MetricBox icon="🍚" label="进食" value={`${log.food_amount ?? '--'}g`} />
        <MetricBox icon="💧" label="饮水" value={`${log.water_amount ?? '--'}ml`} />
        <MetricBox icon="💩" label="排便" value={`${log.poop_count ?? '--'}次`} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-paw-background px-3 py-1 text-paw-muted">
          心情：{log.mood || '未记录'}
        </span>
        {log.activity_minutes !== null && log.activity_minutes !== undefined && (
          <span className="rounded-full bg-paw-background px-3 py-1 text-paw-muted">
            活动：{log.activity_minutes}分钟
          </span>
        )}
        {log.interaction_minutes !== null && log.interaction_minutes !== undefined && (
          <span className="rounded-full bg-paw-background px-3 py-1 text-paw-muted">
            互动：{log.interaction_minutes}分钟
          </span>
        )}
        {log.poop_status && (
          <span className="rounded-full bg-paw-background px-3 py-1 text-paw-muted">
            排便：{log.poop_status}
          </span>
        )}
      </div>

      {log.symptoms?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {log.symptoms.map((symptom) => (
            <span className="rounded-full bg-paw-warning/10 px-3 py-1 text-xs font-semibold text-paw-secondary" key={symptom}>
              {symptom}
            </span>
          ))}
        </div>
      )}

      {log.notes && (
        <p className="mt-3 rounded-control bg-paw-background p-3 text-xs leading-5 text-paw-secondary">
          {log.notes}
        </p>
      )}
    </section>
  );
}

export default HealthLogDayDetail;
